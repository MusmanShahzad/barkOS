"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronLeft, ChevronRight, Filter, HelpCircle, Loader2, Search, X } from "lucide-react"
import { mockBriefs, mockProducts, mockUsers } from "@/lib/mock-data"
import BriefModal from "@/components/brief-modal"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserHoverCard } from "@/components/user-hover-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [briefs, setBriefs] = useState([])
  const [filteredBriefs, setFilteredBriefs] = useState([])
  const [editingBrief, setEditingBrief] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [calendarDays, setCalendarDays] = useState([])
  const [userWorkloads, setUserWorkloads] = useState({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const { toast } = useToast()

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilters, setStatusFilters] = useState({
    Draft: true,
    Review: true,
    Approved: true,
  })
  const [productFilters, setProductFilters] = useState({})
  const [tagFilters, setTagFilters] = useState({})

  // Load initial data
  useEffect(() => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setBriefs(mockBriefs)
      setFilteredBriefs(mockBriefs)

      // Initialize product filters
      const products = {}
      mockProducts.forEach((product) => {
        products[product] = true
      })
      setProductFilters(products)

      // Initialize tag filters
      const allTags = {}
      mockBriefs.forEach((brief) => {
        brief.tags.forEach((tag) => {
          allTags[tag] = true
        })
      })
      setTagFilters(allTags)

      setIsLoading(false)
    }, 1500)
  }, [])

  // Generate an array of dates for the current week
  useEffect(() => {
    const days = []
    const startDate = new Date(currentDate)

    // Set to the beginning of the week (Sunday)
    startDate.setDate(currentDate.getDate() - currentDate.getDay())

    // Generate 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }

    setCalendarDays(days)
  }, [currentDate])

  // Apply filters whenever filter criteria change
  useEffect(() => {
    if (!isLoading) {
      applyFilters()
    }
  }, [searchQuery, statusFilters, productFilters, tagFilters, briefs, isLoading])

  // Calculate user workloads whenever filtered briefs or calendar days change
  useEffect(() => {
    if (!isLoading) {
      calculateUserWorkloads()
    }
  }, [filteredBriefs, calendarDays, isLoading])

  const applyFilters = () => {
    setIsLoadingMore(true)

    // Simulate API delay
    setTimeout(() => {
      let result = [...briefs]

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        result = result.filter(
          (brief) =>
            brief.title.toLowerCase().includes(query) ||
            brief.targetAudience.toLowerCase().includes(query) ||
            brief.hookAngle.toLowerCase().includes(query),
        )
      }

      // Apply status filters
      const activeStatusFilters = Object.entries(statusFilters)
        .filter(([_, isActive]) => isActive)
        .map(([status]) => status)

      if (activeStatusFilters.length > 0) {
        result = result.filter((brief) => activeStatusFilters.includes(brief.status))
      }

      // Apply product filters
      const activeProductFilters = Object.entries(productFilters)
        .filter(([_, isActive]) => isActive)
        .map(([product]) => product)

      if (activeProductFilters.length > 0) {
        result = result.filter((brief) => activeProductFilters.includes(brief.product))
      }

      // Apply tag filters
      const activeTagFilters = Object.entries(tagFilters)
        .filter(([_, isActive]) => isActive)
        .map(([tag]) => tag)

      if (activeTagFilters.length > 0) {
        result = result.filter((brief) => brief.tags.some((tag) => activeTagFilters.includes(tag)))
      }

      setFilteredBriefs(result)
      setIsLoadingMore(false)
    }, 500)
  }

  const clearAllFilters = () => {
    setSearchQuery("")

    setStatusFilters({
      Draft: true,
      Review: true,
      Approved: true,
    })

    setProductFilters(
      Object.keys(productFilters).reduce((acc, product) => {
        acc[product] = true
        return acc
      }, {}),
    )

    setTagFilters(
      Object.keys(tagFilters).reduce((acc, tag) => {
        acc[tag] = true
        return acc
      }, {}),
    )
  }

  const areFiltersActive = () => {
    // Check if any filters are active (not all are selected)
    const allStatusSelected = Object.values(statusFilters).every((value) => value)
    const allProductsSelected = Object.values(productFilters).every((value) => value)
    const allTagsSelected = Object.values(tagFilters).every((value) => value)

    return searchQuery.trim() !== "" || !allStatusSelected || !allProductsSelected || !allTagsSelected
  }

  const getActiveFilterCount = () => {
    let count = 0

    if (searchQuery.trim() !== "") count++

    const inactiveStatusCount = Object.values(statusFilters).filter((value) => !value).length
    if (inactiveStatusCount > 0) count++

    const inactiveProductCount = Object.values(productFilters).filter((value) => !value).length
    if (inactiveProductCount > 0) count++

    const inactiveTagCount = Object.values(tagFilters).filter((value) => !value).length
    if (inactiveTagCount > 0) count++

    return count
  }

  const calculateUserWorkloads = () => {
    setIsLoadingMore(true)

    // Simulate API delay
    setTimeout(() => {
      const workloads = {}
      const maxTasksPerWeek = 10 // Threshold for 100% workload

      // Initialize workloads for all users
      mockUsers.forEach((user) => {
        workloads[user.id] = {
          user: user,
          totalTasks: 0,
          tasksByDay: Array(7).fill(0),
          tasksByStatus: {
            Draft: 0,
            Review: 0,
            Approved: 0,
          },
          workloadPercentage: 0,
          workloadLevel: "Low",
        }
      })

      // Count tasks for each user
      filteredBriefs.forEach((brief) => {
        const briefDate = new Date(brief.goLive)

        // Check if the brief falls within the current week view
        const dayIndex = calendarDays.findIndex((day) => isSameDay(day, briefDate))
        if (dayIndex >= 0) {
          brief.assignedTo.forEach((user) => {
            if (workloads[user.id]) {
              // Increment total tasks
              workloads[user.id].totalTasks++

              // Increment tasks by day
              workloads[user.id].tasksByDay[dayIndex]++

              // Increment tasks by status
              if (workloads[user.id].tasksByStatus[brief.status] !== undefined) {
                workloads[user.id].tasksByStatus[brief.status]++
              }
            }
          })
        }
      })

      // Calculate workload percentages and levels
      Object.keys(workloads).forEach((userId) => {
        const workload = workloads[userId]

        // Calculate weighted workload (approved tasks count more)
        const weightedTotal =
          workload.tasksByStatus.Draft * 0.5 +
          workload.tasksByStatus.Review * 0.8 +
          workload.tasksByStatus.Approved * 1.2

        // Calculate percentage (capped at 100%)
        workload.workloadPercentage = Math.min(Math.round((weightedTotal / maxTasksPerWeek) * 100), 100)

        // Determine workload level
        if (workload.workloadPercentage < 30) {
          workload.workloadLevel = "Low"
        } else if (workload.workloadPercentage < 70) {
          workload.workloadLevel = "Medium"
        } else if (workload.workloadPercentage < 90) {
          workload.workloadLevel = "High"
        } else {
          workload.workloadLevel = "Overloaded"
        }
      })

      setUserWorkloads(workloads)
      setIsLoadingMore(false)
    }, 500)
  }

  const getWorkloadColor = (workloadLevel) => {
    switch (workloadLevel) {
      case "Low":
        return "bg-green-500"
      case "Medium":
        return "bg-yellow-500"
      case "High":
        return "bg-orange-500"
      case "Overloaded":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleEditBrief = (brief) => {
    setEditingBrief(brief)
    setIsModalOpen(true)
  }

  const handleSaveBrief = (updatedBrief) => {
    setBriefs(briefs.map((brief) => (brief.id === updatedBrief.id ? updatedBrief : brief)))
    setIsModalOpen(false)
    setEditingBrief(null)
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  const navigatePreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const navigateNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const navigateToday = () => {
    setCurrentDate(new Date())
  }

  const formatDayHeader = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const isToday = (date) => {
    const today = new Date()
    return isSameDay(date, today)
  }

  // Get briefs for a specific user on a specific day
  const getUserBriefsForDay = (userId, day) => {
    return filteredBriefs.filter((brief) => {
      const briefDate = new Date(brief.goLive)
      return isSameDay(briefDate, day) && brief.assignedTo.some((user) => user.id === userId)
    })
  }

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result

    // Dropped outside the list or in the same position
    if (!destination) return

    // Find the brief that was dragged
    const brief = briefs.find((b) => b.id === draggableId)
    if (!brief) return

    // Parse the source and destination IDs to get user and day information
    const [sourceUserId, sourceDayIndex] = source.droppableId.split("-")
    const [destUserId, destDayIndex] = destination.droppableId.split("-")

    // Create a copy of the brief to update
    const updatedBrief = { ...brief }

    // If the user changed, update the assigned users
    if (sourceUserId !== destUserId) {
      // Remove the source user if they exist in the assigned users
      const sourceUser = mockUsers.find((u) => u.id === sourceUserId)
      const destUser = mockUsers.find((u) => u.id === destUserId)

      if (sourceUser && destUser) {
        // Remove the source user
        updatedBrief.assignedTo = updatedBrief.assignedTo.filter((u) => u.id !== sourceUserId)

        // Add the destination user if they're not already assigned
        if (!updatedBrief.assignedTo.some((u) => u.id === destUserId)) {
          updatedBrief.assignedTo = [...updatedBrief.assignedTo, destUser]
        }
      }
    }

    // If the day changed, update the go-live date
    if (sourceDayIndex !== destDayIndex) {
      const newDate = new Date(calendarDays[Number.parseInt(destDayIndex)])
      updatedBrief.goLive = newDate
    }

    // Show loading state
    setIsLoadingMore(true)

    // Simulate API call
    setTimeout(() => {
      // Update the briefs array
      const updatedBriefs = briefs.map((b) => (b.id === draggableId ? updatedBrief : b))
      setBriefs(updatedBriefs)
      setIsLoadingMore(false)

      // Show a toast notification
      toast({
        title: "Brief updated",
        description: `"${brief.title}" has been reassigned.`,
      })
    }, 800)
  }

  // Render loading skeleton
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Calendar View</CardTitle>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />

            <div className="grid grid-cols-[150px_1fr] h-[calc(100vh-350px)]">
              <div className="col-span-2 grid grid-cols-[150px_repeat(7,1fr)]">
                <Skeleton className="h-10 w-full" />
                {Array(7)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
              </div>

              <div className="col-span-2 h-full">
                <div className="grid grid-cols-[150px_1fr]">
                  <div className="space-y-1">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                  </div>

                  <div className="grid grid-cols-7">
                    {Array(35)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
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
          <div className="mb-4 p-4 border rounded-lg bg-background">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Filter Briefs</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 text-xs">
                  Clear All
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsFilterOpen(false)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-xs">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search briefs..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1.5 h-6 w-6"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <div className="flex flex-col space-y-2">
                  {Object.keys(statusFilters).map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={statusFilters[status]}
                        onCheckedChange={(checked) => {
                          setStatusFilters({
                            ...statusFilters,
                            [status]: !!checked,
                          })
                        }}
                      />
                      <Label htmlFor={`status-${status}`} className="text-sm cursor-pointer">
                        <Badge variant="outline" className={`${getStatusColor(status)} mr-2`}>
                          {status}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Product</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      Products
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">Select Products</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            const allSelected = Object.values(productFilters).every((v) => v)
                            const newValue = !allSelected

                            setProductFilters(
                              Object.keys(productFilters).reduce((acc, product) => {
                                acc[product] = newValue
                                return acc
                              }, {}),
                            )
                          }}
                        >
                          {Object.values(productFilters).every((v) => v) ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                      {Object.keys(productFilters).map((product) => (
                        <div key={product} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`product-${product}`}
                            checked={productFilters[product]}
                            onCheckedChange={(checked) => {
                              setProductFilters({
                                ...productFilters,
                                [product]: !!checked,
                              })
                            }}
                          />
                          <Label htmlFor={`product-${product}`} className="text-sm cursor-pointer">
                            {product}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(productFilters)
                    .filter(([_, isActive]) => isActive)
                    .map(([product]) => (
                      <Badge key={product} variant="secondary" className="text-xs">
                        {product}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() => {
                            setProductFilters({
                              ...productFilters,
                              [product]: false,
                            })
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Tags</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      Tags
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">Select Tags</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            const allSelected = Object.values(tagFilters).every((v) => v)
                            const newValue = !allSelected

                            setTagFilters(
                              Object.keys(tagFilters).reduce((acc, tag) => {
                                acc[tag] = newValue
                                return acc
                              }, {}),
                            )
                          }}
                        >
                          {Object.values(tagFilters).every((v) => v) ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                      {Object.keys(tagFilters).map((tag) => (
                        <div key={tag} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={tagFilters[tag]}
                            onCheckedChange={(checked) => {
                              setTagFilters({
                                ...tagFilters,
                                [tag]: !!checked,
                              })
                            }}
                          />
                          <Label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                            {tag}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(tagFilters)
                    .filter(([_, isActive]) => isActive)
                    .slice(0, 5)
                    .map(([tag]) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() => {
                            setTagFilters({
                              ...tagFilters,
                              [tag]: false,
                            })
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  {Object.entries(tagFilters).filter(([_, isActive]) => isActive).length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{Object.entries(tagFilters).filter(([_, isActive]) => isActive).length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Results Summary */}
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredBriefs.length} of {briefs.length} briefs
              {areFiltersActive() && (
                <span>
                  {" "}
                  with {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Workload Summary */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Team Workload</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Workload is calculated based on the number and status of tasks assigned to each user this week.
                    <br />
                    <br />
                    <span className="font-medium">Draft:</span> 0.5x weight
                    <br />
                    <span className="font-medium">Review:</span> 0.8x weight
                    <br />
                    <span className="font-medium">Approved:</span> 1.2x weight
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {isLoadingMore ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {Object.values(userWorkloads).map((workload) => (
                <UserHoverCard
                  key={workload.user.id}
                  user={workload.user}
                  trigger={
                    <div className="flex flex-col p-2 bg-background rounded-md cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={workload.user.avatar || "/placeholder.svg"} alt={workload.user.name} />
                            <AvatarFallback>{workload.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">{workload.user.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${getWorkloadColor(workload.workloadLevel)} text-white`}
                        >
                          {workload.workloadLevel}
                        </Badge>
                      </div>
                      <Progress value={workload.workloadPercentage} className="h-2 mb-1" />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{workload.totalTasks} tasks</span>
                        <span>{workload.workloadPercentage}%</span>
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-[150px_1fr] h-[calc(100vh-350px)]">
          {/* Header row with days */}
          <div className="col-span-2 grid grid-cols-[150px_repeat(7,1fr)]">
            <div className="border-b border-r p-2 font-medium">Users</div>
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`border-b border-r p-2 text-center font-medium ${isToday(day) ? "bg-primary/10" : ""}`}
              >
                {formatDayHeader(day)}
              </div>
            ))}
          </div>

          {/* Scrollable body */}
          <ScrollArea className="col-span-2 h-full">
            <div className="grid grid-cols-[150px_1fr]">
              {/* Users column with workload indicators */}
              <div className="space-y-1">
                {mockUsers.map((user) => {
                  const workload = userWorkloads[user.id] || {
                    workloadLevel: "Low",
                    workloadPercentage: 0,
                    totalTasks: 0,
                  }

                  return (
                    <UserHoverCard
                      key={user.id}
                      user={user}
                      trigger={
                        <div className="border-b border-r p-2 h-24">
                          <div className="flex flex-col h-full justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="text-sm font-medium">{user.name}</div>
                            </div>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-muted-foreground">Workload</span>
                                      <span className="text-xs font-medium">{workload.workloadPercentage}%</span>
                                    </div>
                                    <Progress
                                      value={workload.workloadPercentage}
                                      className={`h-2 ${
                                        workload.workloadPercentage > 90
                                          ? "bg-red-200 dark:bg-red-900"
                                          : workload.workloadPercentage > 70
                                            ? "bg-orange-200 dark:bg-orange-900"
                                            : workload.workloadPercentage > 30
                                              ? "bg-yellow-200 dark:bg-yellow-900"
                                              : "bg-green-200 dark:bg-green-900"
                                      }`}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs">
                                    <div className="font-medium mb-1">Task Breakdown:</div>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                      <span>Draft:</span>
                                      <span>{workload.tasksByStatus?.Draft || 0}</span>
                                      <span>Review:</span>
                                      <span>{workload.tasksByStatus?.Review || 0}</span>
                                      <span>Approved:</span>
                                      <span>{workload.tasksByStatus?.Approved || 0}</span>
                                      <span className="font-medium">Total:</span>
                                      <span className="font-medium">{workload.totalTasks}</span>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      }
                    />
                  )
                })}
              </div>

              {/* Calendar grid */}
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-7">
                  {mockUsers.map((user) => (
                    <React.Fragment key={user.id}>
                      {calendarDays.map((day, dayIndex) => {
                        const droppableId = `${user.id}-${dayIndex}`
                        const workload = userWorkloads[user.id]
                        const isHighWorkload = workload && workload.workloadPercentage >= 90
                        const userBriefs = getUserBriefsForDay(user.id, day)

                        return (
                          <Droppable key={droppableId} droppableId={droppableId}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`border-b border-r p-2 h-24 overflow-y-auto ${
                                  isToday(day) ? "bg-primary/5" : ""
                                } ${
                                  snapshot.isDraggingOver && isHighWorkload
                                    ? "bg-red-50 dark:bg-red-900/20"
                                    : snapshot.isDraggingOver
                                      ? "bg-secondary"
                                      : ""
                                }`}
                              >
                                {isLoadingMore ? (
                                  <div className="h-full flex items-center justify-center">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </div>
                                ) : userBriefs.length === 0 ? (
                                  <div className="h-full flex items-center justify-center text-[10px] text-muted-foreground">
                                    {snapshot.isDraggingOver ? "Drop here" : ""}
                                  </div>
                                ) : (
                                  userBriefs.map((brief, index) => (
                                    <Draggable key={brief.id} draggableId={brief.id} index={index}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          onClick={() => handleEditBrief(brief)}
                                          className={`mb-1 p-1 rounded text-xs cursor-pointer ${
                                            snapshot.isDragging ? "bg-primary/20 shadow-lg" : "hover:bg-muted"
                                          } transition-colors`}
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium truncate">{brief.title}</span>
                                            <Badge
                                              variant="outline"
                                              className={`${getStatusColor(brief.status)} text-[10px] h-4 ml-1`}
                                            >
                                              {brief.status}
                                            </Badge>
                                          </div>
                                          <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                                            {brief.product}
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))
                                )}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </DragDropContext>
            </div>
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
          onSave={handleSaveBrief}
          brief={editingBrief}
        />
      )}
    </Card>
  )
}
