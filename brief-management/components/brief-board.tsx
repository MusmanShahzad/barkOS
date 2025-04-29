"use client"

import { useState, useEffect, useRef } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileImage, Loader2, Filter } from "lucide-react"
import { formatDate } from "@/lib/utils"
import BriefModal from "@/components/brief-modal"
import { useToast } from "@/hooks/use-toast"
import { BriefBoardSkeleton } from "@/components/loading-skeletons"
import { 
  useGetBriefsQuery, 
  useUpdateBriefMutation, 
  Brief, 
  BriefStatus,
  DateRangeInput
} from "@/src/graphql/generated/graphql"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import BriefFilters from "@/components/brief-filters"

// Define column structure type
interface ColumnData {
  Draft: Brief[];
  Review: Brief[];
  Approved: Brief[];
  [key: string]: Brief[];
}

export default function BriefBoard() {
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [editingBrief, setEditingBrief] = useState<Brief | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(30) // Larger page size for board view
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    Draft: true,
    Review: true,
    Approved: true,
    Live: true
  })
  const [productFilters, setProductFilters] = useState<Record<number, boolean>>({})
  const [tagFilters, setTagFilters] = useState<Record<number, boolean>>({})
  const [objectiveFilters, setObjectiveFilters] = useState<Record<number, boolean>>({})

  // Build filters based on user inputs
  const buildFilters = (): BriefFilters => {
    const filters: any = {};
    
    // Add search filter
    if (searchQuery.trim()) {
      filters.search = searchQuery.trim();
    }
    
    // Add status filter if not all are selected
    if (Object.values(statusFilters).some(v => !v)) {
      filters.status = Object.entries(statusFilters)
        .filter(([_, isActive]) => isActive)
        .map(([status]) => status as BriefStatus);
    }
    
    // Add product filter if not all are selected
    if (Object.entries(productFilters).filter(([_, isActive]) => isActive).length < Object.keys(productFilters).length && 
        Object.entries(productFilters).some(([_, isActive]) => isActive)) {
      filters.productId = parseInt(Object.entries(productFilters).find(([_, isActive]) => isActive)?.[0] || "0");
    }
    
    // Add objective filter if not all are selected
    if (Object.entries(objectiveFilters).filter(([_, isActive]) => isActive).length < Object.keys(objectiveFilters).length && 
        Object.entries(objectiveFilters).some(([_, isActive]) => isActive)) {
      filters.objectiveId = parseInt(Object.entries(objectiveFilters).find(([_, isActive]) => isActive)?.[0] || "0");
    }
    
    // Add tag filter if not all are selected
    if (Object.entries(tagFilters).filter(([_, isActive]) => isActive).length < Object.keys(tagFilters).length && 
        Object.entries(tagFilters).some(([_, isActive]) => isActive)) {
      filters.tagIds = Object.entries(tagFilters)
        .filter(([_, isActive]) => isActive)
        .map(([id]) => parseInt(id));
    }
    
    return filters as BriefFilters;
  };

  // GraphQL query to fetch all briefs with a single query
  const { data, loading, refetch } = useGetBriefsQuery({
    variables: {
      pagination: {
        page: currentPage,
        pageSize
      },
      filters: buildFilters(),
      sort: [{ field: "CREATED_AT", order: "DESC" }]
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true
  })

  // Mutation to update brief status
  const [updateBrief] = useUpdateBriefMutation()

  // Reset data when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
      setBriefs([]);
    } else {
      refetch();
    }
  }, [searchQuery, statusFilters, productFilters, tagFilters, objectiveFilters]);

  // Set briefs when data is loaded
  useEffect(() => {
    if (data?.getBriefs?.briefs) {
      const processedBriefs = data.getBriefs.briefs.filter(Boolean) as Brief[];
      
      if (currentPage === 1) {
        setBriefs(processedBriefs);
      } else {
        setBriefs(prev => {
          // Deduplicate briefs when adding new ones
          const existingIds = new Set(prev.map(brief => brief.id));
          const uniqueNewBriefs = processedBriefs.filter(brief => !existingIds.has(brief.id));
          return [...prev, ...uniqueNewBriefs];
        });
      }
      
      setIsLoadingMore(false);
    }
  }, [data?.getBriefs?.briefs, currentPage]);

  // Set up the intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && data?.getBriefs?.hasNextPage && !loading && !isLoadingMore) {
          setIsLoadingMore(true);
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [data?.getBriefs?.hasNextPage, loading, isLoadingMore]);

  // Group briefs by status
  const columns: ColumnData = {
    Draft: briefs.filter((brief) => brief.status === "Draft"),
    Review: briefs.filter((brief) => brief.status === "Review"),
    Approved: briefs.filter((brief) => brief.status === "Approved"),
  }

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Dropped outside the list
    if (!destination) return

    // Dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Find the brief that was dragged
    const brief = briefs.find((b) => b.id === parseInt(draggableId))
    
    if (!brief) return

    // Don't update if status is the same
    if (brief.status === destination.droppableId) return

    try {
      // Optimistically update UI
      const updatedBrief = {
        ...brief,
        status: destination.droppableId as BriefStatus
      }

      // Update local state
      const updatedBriefs = briefs.map((b) => 
        b.id === updatedBrief.id ? updatedBrief : b
      )
      setBriefs(updatedBriefs)

      // Send mutation to update status
      const result = await updateBrief({
        variables: {
          id: parseInt(draggableId),
          input: {
            title: brief.title,
            description: brief.description || "",
            status: destination.droppableId as BriefStatus,
            product_id: brief.product?.id,
            objective_id: brief.objective?.id,
            go_live_on: brief.go_live_on,
            about_target_audience: brief.about_target_audience || "",
            about_hook: brief.about_hook || "",
            // Fix TypeScript errors by filtering out undefined values
            tagIds: brief.tags?.filter(tag => tag?.id !== undefined)
                            .map(tag => tag!.id) || [],
            userIds: brief.users?.filter(user => user?.id !== undefined)
                             .map(user => user!.id) || []
          }
        }
      })

      if (result.data?.updateBrief) {
        toast({
          title: "Brief updated",
          description: `"${brief.title}" moved to ${destination.droppableId}`,
        })
      }
    } catch (error) {
      console.error("Error updating brief status:", error)
      toast({
        title: "Update failed",
        description: "Failed to update brief status. Please try again.",
        variant: "destructive"
      })
      
      // Revert the optimistic update by refetching
      await refetch()
      setCurrentPage(1)
      setBriefs([])
    }
  }

  const handleEditBrief = (brief: Brief) => {
    setEditingBrief(brief)
    setIsModalOpen(true)
  }

  const handleBriefSuccess = async (updatedBrief: Brief) => {
    setIsModalOpen(false)
    setEditingBrief(null)
    
    try {
      // Reset page and briefs to trigger a fresh load
      setCurrentPage(1)
      setBriefs([])
      await refetch()
      
      toast({
        title: "Brief updated",
        description: `"${updatedBrief.title}" updated successfully`,
      })
    } catch (error) {
      console.error('Error refetching briefs:', error)
      toast({
        title: "Refresh failed",
        description: "Failed to refresh brief board. Please reload the page.",
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

  if (loading && currentPage === 1 && !data) {
    return <BriefBoardSkeleton />
  }

  const hasNextPage = data?.getBriefs?.hasNextPage || false;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Brief Board</h2>
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
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="mb-4">
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
        </div>
      )}

      <div className="flex-grow">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {Object.keys(columns).map((columnId) => (
              <div key={columnId} className="flex flex-col h-full">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{columnId}</h3>
                  <Badge variant="outline">{columns[columnId].length}</Badge>
                </div>

                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="bg-muted/50 rounded-lg p-2 flex-1 min-h-[500px] overflow-y-auto"
                    >
                      {columns[columnId].length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          {loading ? "Loading..." : "No briefs found"}
                        </div>
                      ) : (
                        columns[columnId].map((brief: Brief, index: number) => (
                          <Draggable key={brief.id} draggableId={brief.id.toString()} index={index}>
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-2 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleEditBrief(brief)}
                              >
                                <CardHeader className="p-3 pb-0">
                                  <CardTitle className="text-sm font-medium">{brief.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-2">
                                  <div className="text-xs text-muted-foreground mb-2 truncate">
                                    {brief.about_target_audience || "No target audience specified"}
                                  </div>

                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center">
                                      <Calendar className="mr-1 h-3 w-3" />
                                      {brief.go_live_on ? formatDate(brief.go_live_on) : "No date"}
                                    </div>

                                    {brief.assets && brief.assets.length > 0 && (
                                      <div className="flex items-center">
                                        <FileImage className="mr-1 h-3 w-3" />
                                        {brief.assets.length}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex -space-x-2">
                                      {brief.users && brief.users
                                        .filter(user => user !== null)
                                        .slice(0, 3)
                                        .map((user, i: number) => user && (
                                          <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                            <AvatarImage 
                                              src={user.profile_image || "/placeholder.svg"} 
                                              alt={user.full_name || ''}
                                            />
                                            <AvatarFallback className="text-[10px]">
                                              {user.full_name ? user.full_name.charAt(0) : '?'}
                                            </AvatarFallback>
                                          </Avatar>
                                        ))}
                                      {brief.users && brief.users.filter(user => user !== null).length > 3 && (
                                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted border-2 border-background text-[10px]">
                                          +{brief.users.filter(user => user !== null).length - 3}
                                        </div>
                                      )}
                                    </div>

                                    {brief.tags && brief.tags.length > 0 && brief.tags[0] && (
                                      <div className="flex items-center">
                                        <Badge variant="outline" className="text-[10px] h-5">
                                          {brief.tags[0].name}
                                        </Badge>
                                        {brief.tags.length > 1 && (
                                          <Badge variant="outline" className="ml-1 text-[10px] h-5">
                                            +{brief.tags.length - 1}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Infinite scroll loading indicator - outside the grid for global loading */}
      {(hasNextPage || isLoadingMore) && (
        <div ref={loadMoreRef} className="py-4 text-center">
          {isLoadingMore || (loading && currentPage > 1) ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading more briefs...</span>
            </div>
          ) : (
            <div className="h-8" />
          )}
        </div>
      )}

      <BriefModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingBrief(null)
        }}
        onSuccess={handleBriefSuccess}
        brief={editingBrief}
      />
    </div>
  )
}
