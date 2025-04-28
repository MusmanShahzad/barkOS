"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MoreHorizontal, Search, Plus, Loader2, ArrowUpDown } from "lucide-react"
import BriefModal from "@/components/brief-modal"
import { formatDate } from "@/lib/utils"
import { BriefListSkeleton } from "@/components/loading-skeletons"
import { 
  useGetBriefsQuery, 
  GetBriefsDocument, 
  Brief, 
  BriefStatus,
  BriefFilters,
  BriefSort,
  SortOrder,
  PaginationInput
} from "@/src/graphql/generated/graphql"
import { useApolloClient } from "@apollo/client"
import { toast } from "sonner"

// Define local types for sorting to avoid conflicts
type LocalSortField = 'TITLE' | 'CREATED_AT' | 'GO_LIVE_ON' | 'STATUS'
type LocalSortOrder = 'ASC' | 'DESC'

export default function BriefList() {
  // State for managing search, filters, and pagination
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [editingBrief, setEditingBrief] = useState<Brief | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortField, setSortField] = useState<LocalSortField>("CREATED_AT")
  const [sortOrder, setSortOrder] = useState<LocalSortOrder>("DESC")
  
  // Local state to store accumulated briefs for infinite scroll
  const [loadedBriefs, setLoadedBriefs] = useState<Brief[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Initialize Apollo client for manual refetching
  const client = useApolloClient()

  // Build filters based on user input
  const buildFilters = (): BriefFilters => {
    const filters: any = {}
    
    // Add search filter
    if (searchQuery.trim()) {
      filters.search = searchQuery.trim()
    }
    
    // Add status filter if not "all"
    if (statusFilter !== "all") {
      filters.status = [statusFilter.toUpperCase() as BriefStatus]
    }
    
    return filters as BriefFilters
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
  }, [searchQuery, statusFilter, sortField, sortOrder]);

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

  // Handle successful brief creation/update
  const handleBriefSuccess = async (brief: Brief) => {
    setIsModalOpen(false);
    setEditingBrief(null);
    
    try {
      // First refetch to get new data
      await refetch();
      
      // Then reset the page and clear briefs
      // This will trigger the useEffect that watches data?.getBriefs?.briefs
      setCurrentPage(1);
      setLoadedBriefs([]);
      
      // Clear cache to ensure fresh data
      client.cache.evict({ fieldName: 'getBriefs' });
      client.cache.evict({ fieldName: 'getBrief' });
      client.cache.gc();
      
      toast.success(`Brief "${brief.title}" ${editingBrief ? 'updated' : 'created'} successfully`);
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

  // Shortcuts for readability
  const briefs = loadedBriefs;
  const totalCount = data?.getBriefs?.totalCount || 0;
  const hasNextPage = data?.getBriefs?.hasNextPage || false;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search briefs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading && currentPage === 1}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading && currentPage === 1}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="live">Live</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateBrief}>
            <Plus className="h-4 w-4 mr-1" />
            New Brief
          </Button>
        </div>
      </div>

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
          {loading && currentPage === 1 ? "Loading..." : `${totalCount} brief${totalCount !== 1 ? "s" : ""}`}
        </div>
      </div>

      {loading && currentPage === 1 ? (
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
                    No briefs found. Try adjusting your filters or create a new brief.
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
                            onClick={(e) => {
                              e.stopPropagation()
                              // You can add delete functionality here
                              toast.error("Delete functionality not implemented")
                            }}
                          >
                            Delete
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
              className="py-4 flex justify-center items-center border-t"
            >
              {isLoadingMore || (loading && currentPage > 1) ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading more briefs...</span>
                </div>
              ) : (
                <div className="h-8" />
              )}
            </div>
          )}
          
          {/* End of results message */}
          {!hasNextPage && briefs.length > 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground border-t">
              {totalCount ? (
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
        }}
        onSuccess={handleBriefSuccess}
        brief={editingBrief}
      />
    </div>
  )
}
