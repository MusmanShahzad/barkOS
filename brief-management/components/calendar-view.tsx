"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Loader2, 
  Search, 
  X
} from "lucide-react"
import BriefModal from "@/components/brief-modal"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  useGetBriefsQuery, 
  useGetBriefDropDownsQuery,
  useUpdateBriefMutation,
  Brief, 
  BriefStatus,
  DateRangeInput
} from "@/src/graphql/generated/graphql"
import { formatDate, cn } from "@/lib/utils"
import { format, isSameDay, isWithinInterval, addDays, startOfWeek, endOfWeek, subWeeks, addWeeks, differenceInDays, parseISO } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import BriefFilters from "@/components/brief-filters"
import { ApolloClient, useApolloClient } from "@apollo/client"
import { GetBriefsDocument } from "@/src/graphql/generated/graphql"

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarWeeks, setCalendarWeeks] = useState<Date[][]>([])
  const [visibleWeeks, setVisibleWeeks] = useState(3) // Number of weeks to display
  const [editingBrief, setEditingBrief] = useState<Brief | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(200) // Larger page size to accommodate multiple weeks
  const calendarRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const client = useApolloClient()

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    Draft: true,
    Review: true,
    Approved: true,
  })
  const [productFilters, setProductFilters] = useState<Record<number, boolean>>({})
  const [tagFilters, setTagFilters] = useState<Record<number, boolean>>({})
  const [objectiveFilters, setObjectiveFilters] = useState<Record<number, boolean>>({})

  // Mutation to update brief
  const [updateBrief, { loading: updateLoading }] = useUpdateBriefMutation()

  // Create date range for current calendar view
  const getDateRange = useCallback((): DateRangeInput => {
    const startDay = startOfWeek(currentDate, { weekStartsOn: 0 }) // Sunday
    const endDay = endOfWeek(addWeeks(currentDate, visibleWeeks - 1), { weekStartsOn: 0 })
    
    return {
      startDate: format(startDay, 'yyyy-MM-dd'),
      endDate: format(endDay, 'yyyy-MM-dd')
    }
  }, [currentDate, visibleWeeks])

  // GraphQL query to fetch briefs
  const { data, loading, refetch, fetchMore } = useGetBriefsQuery({
    variables: {
      pagination: {
        page: 1,
        pageSize
      },
      filters: {
        ...(searchQuery ? { search: searchQuery } : {}),
        ...(Object.values(statusFilters).some(v => !v) ? { 
          status: Object.entries(statusFilters)
            .filter(([_, isActive]) => isActive)
            .map(([status]) => status as BriefStatus)
        } : {}),
        ...(Object.entries(productFilters).filter(([_, isActive]) => isActive).length < Object.keys(productFilters).length ? {
          productId: parseInt(Object.entries(productFilters).find(([_, isActive]) => isActive)?.[0] || "0")
        } : {}),
        ...(Object.entries(objectiveFilters).filter(([_, isActive]) => isActive).length < Object.keys(objectiveFilters).length ? {
          objectiveId: parseInt(Object.entries(objectiveFilters).find(([_, isActive]) => isActive)?.[0] || "0")
        } : {}),
        ...(Object.entries(tagFilters).filter(([_, isActive]) => isActive).length < Object.keys(tagFilters).length ? {
          tagIds: Object.entries(tagFilters)
            .filter(([_, isActive]) => isActive)
            .map(([id]) => parseInt(id))
        } : {}),
        goLiveOn: getDateRange() // Add date range filter based on current visible weeks
      },
      sort: [{ field: "GO_LIVE_ON", order: "ASC" }]
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true
  })

  // Generate calendar weeks
  useEffect(() => {
    // Calculate the first day of the view (start of the week containing the current date)
    const startDay = startOfWeek(currentDate, { weekStartsOn: 0 }) // 0 = Sunday
    
    // Generate weeks
    const weeks: Date[][] = []
    
    for (let weekIndex = 0; weekIndex < visibleWeeks; weekIndex++) {
      const week: Date[] = []
      const weekStart = addWeeks(startDay, weekIndex)
      
      // Generate 7 days for each week
    for (let i = 0; i < 7; i++) {
        week.push(addDays(weekStart, i))
    }

      weeks.push(week)
    }

    setCalendarWeeks(weeks)
  }, [currentDate, visibleWeeks])

  // Refetch data when calendar view or filters change
  useEffect(() => {
    refetch()
  }, [currentDate, visibleWeeks, refetch])

  // Separate effect for filter changes to avoid excessive refetching
  useEffect(() => {
    const timer = setTimeout(() => {
      refetch()
    }, 300) // Debounce filter changes
    
    return () => clearTimeout(timer)
  }, [searchQuery, statusFilters, productFilters, tagFilters, objectiveFilters, refetch])

  // Navigation functions
  const navigatePreviousWeek = () => {
    setCurrentDate(prevDate => subWeeks(prevDate, 1))
  }

  const navigateNextWeek = () => {
    setCurrentDate(prevDate => addWeeks(prevDate, 1))
  }

  const navigateToday = () => {
    setCurrentDate(new Date())
  }

  // Infinite scroll to load more weeks
  const handleScroll = useCallback(() => {
    if (!calendarRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = calendarRef.current
    const scrollBottom = scrollHeight - scrollTop - clientHeight
    
    // Load more weeks when user scrolls near the bottom
    if (scrollBottom < 200 && !loading) {
      setVisibleWeeks(prev => Math.min(prev + 1, 8)) // Cap at 8 weeks for performance
    }
  }, [loading])

  // Add scroll event listener
  useEffect(() => {
    const currentRef = calendarRef.current
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll)
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll)
      }
    }
  }, [handleScroll])

  // Helper functions
  const formatDayHeader = (date: Date): string => {
    return format(date, "EEE, MMM d")
  }

  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date())
  }

  // Get briefs for a specific day
  const getBriefsForDay = (day: Date): Brief[] => {
    if (!data?.getBriefs?.briefs) return []
    
    return data.getBriefs.briefs.filter(brief => {
      if (!brief || !brief.go_live_on) return false
      
      // Check if this brief's go_live_on date matches the day
      const briefDate = new Date(brief.go_live_on)
      return isSameDay(briefDate, day)
    }) as Brief[]
  }

  // Determine brief cell background based on its date and status
  const getBriefBackgroundClass = (brief: Brief): string => {
    if (!brief.go_live_on) return ""
    
    const today = new Date()
    const briefDate = new Date(brief.go_live_on)
    const isPastDue = briefDate < today
    const isNearFuture = differenceInDays(briefDate, today) <= 3
    
    // Past due non-approved brief
    if (isPastDue && brief.status !== "Approved" && brief.status !== "Live") {
      return "bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800"
    }
    
    // Near future (within 3 days)
    if (isNearFuture) {
      return "bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800"
    }
    
    // Default - far future
    return "border-gray-200 dark:border-gray-700"
  }

  // Status badge styling
  const getStatusColor = (status: BriefStatus): string => {
    switch (status) {
      case "Draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "Review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "Approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "Live":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  // Handle drag and drop of briefs
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result
    
    // Dropped outside the list or in the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return
    }
    
    // Find the brief that was dragged
    const briefId = parseInt(draggableId.split('-')[1])
    const brief = data?.getBriefs?.briefs?.find(b => b?.id === briefId)
    
    if (!brief) return
    
    // Parse the destination day ID
    // Format of droppableId: "day-YYYY-MM-DD"
    const [_, ...dateParts] = destination.droppableId.split('-')
    const newGoLiveDate = dateParts.join('-')
    
    // Create a copy of the brief with updated date for optimistic UI
    const updatedBrief = {
      ...brief,
      go_live_on: newGoLiveDate
    }
    
    try {
      // Immediately update the calendar view with the new date
      // This avoids waiting for API response or refetch
      if (data?.getBriefs?.briefs) {
        // Create a new array with the updated brief
        const updatedBriefs = data.getBriefs.briefs.map(b => {
          if (b && b.id === briefId) {
            return updatedBrief
          }
          return b
        })
        
        // Manually update the Apollo cache to reflect changes immediately
        // This will update the UI without fetching from server
        const existingData = { ...data }
        if (existingData.getBriefs) {
          existingData.getBriefs.briefs = updatedBriefs
        }
        
        // Use cache writes instead of refetch for immediate UI updates
        const cache = client?.cache
        if (cache) {
          cache.writeQuery({
            query: GetBriefsDocument,
            variables: {
              pagination: {
                page: 1,
                pageSize
              },
              filters: {
                ...(searchQuery ? { search: searchQuery } : {}),
                ...(Object.values(statusFilters).some(v => !v) ? { 
                  status: Object.entries(statusFilters)
                    .filter(([_, isActive]) => isActive)
                    .map(([status]) => status as BriefStatus)
                } : {}),
                ...(Object.entries(productFilters).filter(([_, isActive]) => isActive).length < Object.keys(productFilters).length ? {
                  productId: parseInt(Object.entries(productFilters).find(([_, isActive]) => isActive)?.[0] || "0")
                } : {}),
                ...(Object.entries(objectiveFilters).filter(([_, isActive]) => isActive).length < Object.keys(objectiveFilters).length ? {
                  objectiveId: parseInt(Object.entries(objectiveFilters).find(([_, isActive]) => isActive)?.[0] || "0")
                } : {}),
                ...(Object.entries(tagFilters).filter(([_, isActive]) => isActive).length < Object.keys(tagFilters).length ? {
                  tagIds: Object.entries(tagFilters)
                    .filter(([_, isActive]) => isActive)
                    .map(([id]) => parseInt(id))
                } : {}),
                goLiveOn: getDateRange()
              },
              sort: [{ field: "GO_LIVE_ON", order: "ASC" }]
            },
            data: existingData
          })
        }
      }
      
      // Update the backend (non-blocking)
      updateBrief({
        variables: {
          id: briefId,
          input: {
            title: brief.title || "",
            description: brief.description || "",
            status: brief.status as BriefStatus,
            product_id: brief.product?.id,
            objective_id: brief.objective?.id,
            go_live_on: newGoLiveDate,
            about_target_audience: brief.about_target_audience || "",
            about_hook: brief.about_hook || "",
            // Fix TypeScript errors by filtering out undefined values
            tagIds: brief.tags?.filter(tag => tag?.id !== undefined)
                            .map(tag => tag!.id) || [],
            userIds: brief.users?.filter(user => user?.id !== undefined)
                             .map(user => user!.id) || []
          }
        }
      }).then(() => {
        toast({
          title: "Brief updated",
          description: `"${brief.title}" moved to ${format(parseISO(newGoLiveDate), 'PP')}`,
          variant: "default"
        })
      }).catch((error) => {
        console.error("Error updating brief:", error)
        toast({
          title: "Error",
          description: "Failed to update brief. Please try again.",
          variant: "destructive"
        })
        
        // Revert the optimistic update by refreshing from the server
        refetch()
      })
    } catch (error) {
      console.error("Error updating UI:", error)
      // Fallback to refetch if there's an error with the optimistic update
      refetch()
    }
  }

  // Brief editing functions
  const handleEditBrief = (brief: Brief) => {
    setEditingBrief(brief)
    setIsModalOpen(true)
  }

  const handleBriefSuccess = async (updatedBrief: Brief) => {
    setIsModalOpen(false)
    setEditingBrief(null)
    
    try {
      await refetch()
      
      toast({
        title: "Brief updated",
        description: `"${updatedBrief.title}" updated successfully`,
      })
    } catch (error) {
      console.error('Error refetching briefs:', error)
      toast({
        title: "Refresh failed",
        description: "Failed to refresh calendar. Please reload the page.",
        variant: "destructive"
      })
    }
  }

  // Filter management
  const clearAllFilters = () => {
    setSearchQuery("")
    
    // Reset status filters
    setStatusFilters(Object.keys(statusFilters).reduce((acc, status) => {
      acc[status] = true
      return acc
    }, {} as Record<string, boolean>))
    
    // Reset product filters
    setProductFilters(Object.keys(productFilters).reduce((acc, id) => {
      acc[parseInt(id)] = true
      return acc
    }, {} as Record<number, boolean>))
    
    // Reset objective filters
    setObjectiveFilters(Object.keys(objectiveFilters).reduce((acc, id) => {
      acc[parseInt(id)] = true
      return acc
    }, {} as Record<number, boolean>))
    
    // Reset tag filters
    setTagFilters(Object.keys(tagFilters).reduce((acc, id) => {
      acc[parseInt(id)] = true
      return acc
    }, {} as Record<number, boolean>))
  }

  const areFiltersActive = (): boolean => {
    // Check if any filters are active (not all are selected)
    const allStatusSelected = Object.values(statusFilters).every((value) => value)
    const allProductsSelected = Object.values(productFilters).every((value) => value)
    const allObjectivesSelected = Object.values(objectiveFilters).every((value) => value)
    const allTagsSelected = Object.values(tagFilters).every((value) => value)

    return searchQuery.trim() !== "" || 
           !allStatusSelected || 
           !allProductsSelected || 
           !allObjectivesSelected || 
           !allTagsSelected
  }

  const getActiveFilterCount = (): number => {
    let count = 0

    if (searchQuery.trim() !== "") count++

    // Count how many filter groups have at least one deselected item
    if (Object.values(statusFilters).some(value => !value)) count++
    if (Object.values(productFilters).some(value => !value)) count++
    if (Object.values(objectiveFilters).some(value => !value)) count++
    if (Object.values(tagFilters).some(value => !value)) count++

    return count
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Calendar View</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={areFiltersActive() ? "default" : "outline"}
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="gap-1"
            >
              <Filter className="h-4 w-4" />
              Filters
              {areFiltersActive() && (
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={navigatePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navigateToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={navigateNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filter Panel */}
        {isFilterOpen && (
          <BriefFilters
            searchQuery={searchQuery}
            statusFilters={statusFilters}
            productFilters={productFilters}
            tagFilters={tagFilters}
            objectiveFilters={objectiveFilters}
            totalCount={data?.getBriefs?.totalCount || 0}
            onSearchChange={(value: string) => setSearchQuery(value)}
            onStatusFilterChange={(status: string, checked: boolean) => {
                          setStatusFilters({
                            ...statusFilters,
                [status]: checked,
              })
            }}
            onProductFilterChange={(id: number, checked: boolean) => {
                              setProductFilters({
                                ...productFilters,
                [id]: checked,
              })
            }}
            onTagFilterChange={(id: number, checked: boolean) => {
                              setTagFilters({
                                ...tagFilters,
                [id]: checked,
              })
            }}
            onObjectiveFilterChange={(id: number, checked: boolean) => {
              setObjectiveFilters({
                ...objectiveFilters,
                [id]: checked,
              })
            }}
            onClearFilters={clearAllFilters}
            onClose={() => setIsFilterOpen(false)}
          />
        )}

        {/* Calendar Legend with improved styling */}
        <div className="mb-4 flex flex-wrap items-center text-xs space-x-4 py-2 px-3 bg-muted/30 rounded-md border">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-sm bg-red-100 dark:bg-red-900/20 mr-2 border border-red-300 dark:border-red-700"></div>
            <span>Past Due</span>
            </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900/20 mr-2 border border-green-300 dark:border-green-700"></div>
            <span>Within 3 Days</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-sm bg-background mr-2 border"></div>
            <span>Future Date</span>
          </div>
          <div className="flex items-center ml-auto text-muted-foreground">
            <span>Drag briefs to reschedule</span>
            </div>
        </div>

        {/* Calendar View with DragDropContext */}
        <div className="h-[calc(100vh-340px)] flex flex-col">
          {/* Calendar header - day names */}
          <div className="grid grid-cols-7 gap-2 mb-3 sticky top-0 z-10 bg-background pb-2 border-b">
            {calendarWeeks[0]?.map((day, index) => (
              <div
                key={index}
                className={cn(
                  "font-medium p-2 text-center rounded-md",
                  isToday(day) ? "bg-primary/10 text-primary" : ""
                )}
              >
                {formatDayHeader(day)}
              </div>
            ))}
          </div>

          {/* Calendar body - scrollable with infinite loading */}
          <ScrollArea className="flex-1" ref={calendarRef}>
            {loading && !data ? (
              // Show loading skeleton only for calendar content
              <div className="space-y-6">
                <div className="grid grid-cols-7 gap-2">
                  {Array(7).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                            </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array(21).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-36 w-full" />
                  ))}
                                    </div>
                                  </div>
            ) : (
              // Normal calendar content
              <div className="space-y-6">
              <DragDropContext onDragEnd={handleDragEnd}>
                  {calendarWeeks.map((week, weekIndex) => (
                    <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-2 min-h-full">
                      {week.map((day) => {
                        // Format date as YYYY-MM-DD for droppableId
                        const dateString = format(day, 'yyyy-MM-dd')
                        const dayBriefs = getBriefsForDay(day)
                        const droppableId = `day-${dateString}`

                        return (
                          <Droppable key={dateString} droppableId={droppableId} type="brief">
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={cn(
                                  "border rounded-md p-2 min-h-[150px] transition-colors",
                                  isToday(day) ? "bg-primary/5 border-primary/30" : "",
                                  snapshot.isDraggingOver ? "bg-secondary/30 border-primary" : ""
                                )}
                                style={{ overflow: "visible" }} // Prevent scrolling
                              >
                                {/* Day Header with better styling */}
                                <div className="text-sm font-medium mb-3 pb-1 border-b flex justify-between items-center">
                                  <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full",
                                    isToday(day) ? "text-primary-foreground bg-primary" : "bg-muted text-muted-foreground"
                                  )}>
                                    {format(day, "d")}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {format(day, "MMMM")}
                                  </span>
                                  </div>

                                {/* Briefs for this day with drag-and-drop */}
                                {dayBriefs.length === 0 ? (
                                  <div className="flex items-center justify-center h-12 text-xs text-muted-foreground">
                                    {snapshot.isDraggingOver ? (
                                      <div className="border-2 border-dashed border-primary/50 rounded-md p-2 w-full text-center">
                                        Drop to schedule
                                      </div>
                                    ) : "No briefs"}
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {dayBriefs.map((brief, index) => (
                                      <Draggable 
                                        key={`brief-${brief.id}`} 
                                        draggableId={`brief-${brief.id}`} 
                                        index={index}
                                      >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                            onClick={snapshot.isDragging ? undefined : () => handleEditBrief(brief)}
                                            className={cn(
                                              "p-2 rounded-md text-xs cursor-grab active:cursor-grabbing border",
                                              getBriefBackgroundClass(brief),
                                              snapshot.isDragging ? "shadow-lg scale-[1.02] ring-2 ring-primary/50" : "hover:border-primary",
                                              "transition-all duration-150"
                                            )}
                                        >
                                          <div className="flex items-center justify-between">
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <span className="font-medium truncate max-w-[120px]">{brief.title}</span>
                                                  </TooltipTrigger>
                                                  <TooltipContent side="top" className="max-w-xs">
                                                    <div className="space-y-1">
                                                      <p className="font-medium">{brief.title}</p>
                                                      {brief.description && <p className="text-xs opacity-80">{brief.description}</p>}
                                                      {brief.objective && <p className="text-xs mt-1">Objective: {brief.objective.name}</p>}
                                                      {brief.product && <p className="text-xs">Product: {brief.product.name}</p>}
                                                      {brief.tags && brief.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                          {brief.tags.slice(0, 3).map(tag => tag && (
                                                            <span key={tag.id} className="text-[10px] px-1.5 py-0.5 bg-muted rounded-sm">
                                                              {tag.name}
                                                            </span>
                                                          ))}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            <Badge
                                              variant="outline"
                                                className={cn(getStatusColor(brief.status as BriefStatus), "text-[10px] h-4 ml-1")}
                                            >
                                              {brief.status}
                                            </Badge>
                                          </div>
                                            <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
                                              <span className="truncate max-w-[80px]">{brief.product?.name}</span>
                                              {brief.tags && brief.tags.length > 0 && brief.tags[0] && (
                                                <span className="px-1.5 py-0.5 bg-muted rounded-sm">
                                                  {brief.tags[0].name}
                                                </span>
                                              )}
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                    ))}
                                  </div>
                                )}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        )
                      })}
                </div>
                  ))}
              </DragDropContext>
                
                {/* Infinite scroll loader - simplified */}
                {visibleWeeks < 8 && !loading && (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    <span className="opacity-60">Change week to see more</span>
            </div>
                )}
                {loading && data && (
                  <div className="py-4 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>

      {editingBrief && (
        <BriefModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingBrief(null)
          }}
          onSuccess={handleBriefSuccess}
          brief={editingBrief}
        />
      )}
    </Card>
  )
}
