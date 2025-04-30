"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MoreHorizontal, Search, Plus, Loader2, ArrowUpDown, Filter } from "lucide-react"
import BriefModal from "@/components/brief-modal"
import { formatDate } from "@/lib/utils"
import { BriefListSkeleton } from "@/components/loading-skeletons"
import { 
  useGetBriefsQuery, 
  GetBriefsDocument, 
  Brief, 
  BriefStatus,
  BriefSort,
  SortOrder,
  PaginationInput,
  useDeleteBriefMutation
} from "@/src/graphql/generated/graphql"
import { useApolloClient } from "@apollo/client"
import { toast } from "sonner"
import BriefFilters from "@/components/brief-filters"

// Define local types for sorting to avoid conflicts
type LocalSortField = 'TITLE' | 'CREATED_AT' | 'GO_LIVE_ON' | 'STATUS'
type LocalSortOrder = 'ASC' | 'DESC'

// Define filter interface to fix TypeScript errors
interface BriefFiltersInterface {
  search?: string;
  status?: BriefStatus[];
  productId?: number;
  objectiveId?: number;
  tagIds?: number[];
}

export default function BriefList() {
  // State for managing search, filters, and pagination
  const [searchQuery, setSearchQuery] = useState("")
  const [editingBrief, setEditingBrief] = useState<Brief | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortField, setSortField] = useState<LocalSortField>("CREATED_AT")
  const [sortOrder, setSortOrder] = useState<LocalSortOrder>("DESC")
  
  // Advanced filter states
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    Draft: true,
    Review: true,
    Approved: true,
  })
  const [productFilters, setProductFilters] = useState<Record<number, boolean>>({})
  const [tagFilters, setTagFilters] = useState<Record<number, boolean>>({})
  const [objectiveFilters, setObjectiveFilters] = useState<Record<number, boolean>>({})
  
  // Local state to store accumulated briefs for infinite scroll
  const [loadedBriefs, setLoadedBriefs] = useState<Brief[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [cachedTotalCount, setCachedTotalCount] = useState(0)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [briefToDelete, setBriefToDelete] = useState<Brief | null>(null)

  // Initialize Apollo client for manual refetching
  const client = useApolloClient()
  
  // Initialize delete mutation
  const [deleteBrief] = useDeleteBriefMutation()

  // Build filters based on user input
  const buildFilters = () => {
    const filters: BriefFiltersInterface = {}
    
    // Add search filter
    if (searchQuery.trim()) {
      filters.search = searchQuery.trim()
    }
    
    // Add status filter if not all are selected
    if (Object.values(statusFilters).some(v => !v)) {
      filters.status = Object.entries(statusFilters)
        .filter(([_, isActive]) => isActive)
        .map(([status]) => status as BriefStatus)
    }
    
    // Add product filter if not all are selected
    if (Object.entries(productFilters).filter(([_, isActive]) => isActive).length < Object.keys(productFilters).length && 
        Object.entries(productFilters).some(([_, isActive]) => isActive)) {
      filters.productId = parseInt(Object.entries(productFilters).find(([_, isActive]) => isActive)?.[0] || "0")
    }
    
    // Add objective filter if not all are selected
    if (Object.entries(objectiveFilters).filter(([_, isActive]) => isActive).length < Object.keys(objectiveFilters).length && 
        Object.entries(objectiveFilters).some(([_, isActive]) => isActive)) {
      filters.objectiveId = parseInt(Object.entries(objectiveFilters).find(([_, isActive]) => isActive)?.[0] || "0")
    }
    
    // Add tag filter if not all are selected
    if (Object.entries(tagFilters).filter(([_, isActive]) => isActive).length < Object.keys(tagFilters).length && 
        Object.entries(tagFilters).some(([_, isActive]) => isActive)) {
      filters.tagIds = Object.entries(tagFilters)
        .filter(([_, isActive]) => isActive)
        .map(([id]) => parseInt(id))
    }
    
    return filters
  }

  // Build sort object for the query
  const buildSort = (): BriefSort[] => {
    return [{
      field: sortField,
      order: sortOrder as SortOrder
    }]
  }

  // Query briefs with current filters and pagination
  const { data, loading, refetch } = useGetBriefsQuery({
    variables: {
      pagination: {
        page: currentPage,
        pageSize
      },
      filters: buildFilters(),
      sort: buildSort()
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true
  })

  // Reset state when search, filter, or sort changes
  useEffect(() => {
    setLoadedBriefs([]);
    setCurrentPage(1);
  }, [searchQuery, statusFilters, productFilters, tagFilters, objectiveFilters, sortField, sortOrder]);

  // Process briefs data when it arrives
  useEffect(() => {
    if (data?.getBriefs?.briefs) {
      const processedBriefs = data.getBriefs.briefs.filter(Boolean) as Brief[];
      
      if (currentPage === 1) {
        setLoadedBriefs(processedBriefs);
      } else {
        setLoadedBriefs(prev => {
          // Deduplicate briefs when adding new ones
          const existingIds = new Set(prev.map(brief => brief.id));
          const uniqueNewBriefs = processedBriefs.filter(brief => !existingIds.has(brief.id));
          return [...prev, ...uniqueNewBriefs];
        });
      }
      
      setIsLoadingMore(false);

      // Update our cached count when we get fresh data
      if (data?.getBriefs?.totalCount !== undefined) {
        setCachedTotalCount(data.getBriefs.totalCount);
      }
    }
  }, [data?.getBriefs?.briefs, currentPage]);

  // Set up the intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && data?.getBriefs?.hasNextPage && !loading) {
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
  }, [data?.getBriefs?.hasNextPage, loading]);

  const handleEditBrief = (brief: Brief) => {
    setEditingBrief(brief)
    setIsModalOpen(true)
  }

  // Create a new brief
  const handleCreateBrief = () => {
    setEditingBrief(null)
    setIsModalOpen(true)
  }

  const refetchBriefs = async () => {
    try {
      // Keep the current briefs visible while refetching
      await refetch();
      
      // Reset to page 1 after successful refetch
      setCurrentPage(1);
      
      // Clear cache to ensure fresh data
      client.cache.evict({ fieldName: 'getBriefs' });
      client.cache.evict({ fieldName: 'getBrief' });
      client.cache.gc();
    } catch (error) {
      console.error('Error refetching briefs:', error);
    }
  }

  // Handle successful brief creation/update
  const handleBriefSuccess = async (brief: Brief) => {
    setIsModalOpen(false);
    setEditingBrief(null);
    
    try {
      // Only refetch data when brief is actually saved/created
      // Not during intermediate operations like asset editing
      if (brief) {
        // First refetch to get new data
        
        await refetchBriefs();
        toast.success(`Brief "${brief.title}" ${editingBrief ? 'updated' : 'created'} successfully`);
      }
    } catch (error) {
      console.error('Error refetching briefs:', error);
      toast.error('Failed to refresh brief list. Please try again.');
    }
  }

  // Handle sorting toggle
  const handleSort = (field: LocalSortField) => {
    if (field === sortField) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // New field - set it and default to DESC order
      setSortField(field);
      setSortOrder('DESC');
    }
    // Reset to first page
    setCurrentPage(1);
  }

  // Function for status badge styling
  const getStatusColor = (status?: string | null) => {
    if (!status) return "bg-gray-100 text-gray-800"
    
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "review":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "live":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-100 text-gray-800"
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

  // Handle delete brief
  const handleDeleteBrief = async (brief: Brief) => {
    try {
      setIsDeleting(true)
      setBriefToDelete(brief)
      
      const result = await deleteBrief({
        variables: {
          id: brief.id
        },
        update: (cache) => {
          // Remove the deleted brief from the cache
          cache.evict({ id: `Brief:${brief.id}` })
          cache.gc()
        }
      })
      
      if (result.data?.deleteBrief) {
        // Success, update local state to remove the brief
        setLoadedBriefs(prev => prev.filter(b => b.id !== brief.id))
        toast.success(`Brief "${brief.title}" deleted successfully`)
      } else {
        toast.error("Failed to delete brief")
      }
    } catch (error) {
      console.error("Error deleting brief:", error)
      toast.error("An error occurred while deleting the brief")
    } finally {
      setIsDeleting(false)
      setBriefToDelete(null)
    }
  }

  // Shortcuts for readability
  const briefs = loadedBriefs;
  const totalCount = loading && cachedTotalCount > 0 ? cachedTotalCount : (data?.getBriefs?.totalCount || 0);
  const hasNextPage = data?.getBriefs?.hasNextPage || false;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
          <h2 className="text-xl font-semibold">Briefs</h2>
        </div>
        
        <Button onClick={handleCreateBrief}>
          <Plus className="h-4 w-4 mr-1" />
          New Brief
        </Button>
      </div>
      
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

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm">
          <span className="font-medium">Sort by: </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${sortField === 'TITLE' ? 'font-medium underline' : ''}`}
            onClick={() => handleSort('TITLE')}
          >
            Title
            {sortField === 'TITLE' && (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${sortField === 'CREATED_AT' ? 'font-medium underline' : ''}`}
            onClick={() => handleSort('CREATED_AT')}
          >
            Created
            {sortField === 'CREATED_AT' && (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${sortField === 'GO_LIVE_ON' ? 'font-medium underline' : ''}`}
            onClick={() => handleSort('GO_LIVE_ON')}
          >
            Go Live
            {sortField === 'GO_LIVE_ON' && (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${sortField === 'STATUS' ? 'font-medium underline' : ''}`}
            onClick={() => handleSort('STATUS')}
          >
            Status
            {sortField === 'STATUS' && (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {/* Show stable count during loading */}
          {totalCount} brief{totalCount !== 1 ? "s" : ""}
        </div>
      </div>

      {loading && currentPage === 1 && !briefs.length ? (
        <BriefListSkeleton />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('TITLE')}
                >
                  <div className="flex items-center gap-2">
                    Brief Title
                    {sortField === 'TITLE' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('GO_LIVE_ON')}
                >
                  <div className="flex items-center gap-2">
                    Go Live
                    {sortField === 'GO_LIVE_ON' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('STATUS')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortField === 'STATUS' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {briefs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {loading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                        <p className="text-sm text-muted-foreground mt-2">Loading briefs...</p>
                      </div>
                    ) : (
                      <span>No briefs found. Try adjusting your filters or create a new brief.</span>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                briefs.map((brief) => (
                  <TableRow
                    key={brief.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEditBrief(brief)}
                  >
                    <TableCell className="font-medium">{brief.title}</TableCell>
                    <TableCell>{brief.product?.name || '-'}</TableCell>
                    <TableCell>{brief.about_target_audience || '-'}</TableCell>
                    <TableCell>
                      {brief.go_live_on ? (
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatDate(brief.go_live_on)}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(brief.status)}>
                        {brief.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {brief.users && brief.users.filter(Boolean).slice(0, 3).map((user, i) => user && (
                          <Avatar key={i} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={user.profile_image || "/placeholder.svg"} alt={user.full_name || ''} />
                            <AvatarFallback>{user.full_name ? user.full_name.charAt(0) : '?'}</AvatarFallback>
                          </Avatar>
                        ))}
                        {brief.users && brief.users.filter(Boolean).length > 3 && (
                          <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarFallback>+{brief.users.length - 3}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditBrief(brief)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={isDeleting && briefToDelete?.id === brief.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              //if (confirm(`Are you sure you want to delete "${brief.title}"?`)) {
                              handleDeleteBrief(brief)
                             // }
                            }}
                          >
                            {isDeleting && briefToDelete?.id === brief.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Infinite scroll loader */}
          {hasNextPage && (
            <div 
              ref={loadMoreRef} 
              className="py-4 text-center border-t"
            >
              {isLoadingMore || (loading && currentPage > 1) ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <p className="text-sm text-muted-foreground">Loading more briefs...</p>
                </div>
              ) : (
                <div className="h-8">
                  {/* Invisible spacer for intersection observer */}
                </div>
              )}
            </div>
          )}
          
          {/* Show loader at bottom when loading more or refetching with briefs */}
          {loading && briefs.length > 0 && (
            <div className="py-4 text-center border-t">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">
                  {currentPage > 1 ? "Loading more briefs..." : "Refreshing briefs..."}
                </p>
              </div>
            </div>
          )}
          
          {/* End of results message - only show when not loading */}
          {!loading && !hasNextPage && briefs.length > 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground border-t">
              {totalCount === briefs.length ? (
                <span>Showing all {totalCount} briefs</span>
              ) : (
                <span>End of results</span>
              )}
            </div>
          )}
        </div>
      )}

      <BriefModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingBrief(null)
          refetchBriefs()
        }}
        onSuccess={handleBriefSuccess}
        brief={editingBrief}
      />
    </div>
  )
}
