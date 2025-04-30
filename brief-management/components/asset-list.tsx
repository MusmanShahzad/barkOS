"use client"

import { useState, Dispatch, SetStateAction, useEffect, useCallback } from 'react'
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileIcon, Grid, List, MoreHorizontal, Upload, Search, ArrowUpDown, Loader2 } from "lucide-react"
import { formatDate, formatFileSize } from "@/lib/utils"
import { AssetModal, IAsset } from "@/components/asset-modal"
import AssetPreviewModal from "@/components/asset-preview-modal"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
// @ts-ignore
import { useInView } from 'react-intersection-observer'
import { 
  useDeleteAssetMutation,
  useGetAssetsQuery,
  SortOrder,
  AssetSortField,
  Asset,
  Media,
} from "@/src/graphql/generated/graphql"
import { useApolloClient } from "@apollo/client"

// Simple skeleton components for loading states
const AssetGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {Array.from({ length: 10 }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <div className="aspect-square relative bg-muted">
          <Skeleton className="h-full w-full" />
        </div>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex items-center justify-between mt-2">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <div className="mt-2 flex gap-1">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

const AssetListSkeleton = () => (
  <div className="rounded-md border">
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Size</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Created By</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Created</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Related Tasks</th>
            <th className="h-12 px-4 text-left align-middle font-medium"></th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <td className="p-4 align-middle">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </td>
              <td className="p-4 align-middle">
                <Skeleton className="h-6 w-16 rounded-full" />
              </td>
              <td className="p-4 align-middle">
                <Skeleton className="h-4 w-12" />
              </td>
              <td className="p-4 align-middle">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </td>
              <td className="p-4 align-middle">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="p-4 align-middle">
                <Skeleton className="h-6 w-16 rounded-full" />
              </td>
              <td className="p-4 align-middle">
                <Skeleton className="h-8 w-8 rounded-full" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

// Define our own types to avoid conflicts
type LocalSortOrder = 'ASC' | 'DESC'
type LocalAssetSortField = 'NAME' | 'CREATED_AT'

interface AssetListProps {
  className?: string
}

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: number | null;
  onSuccess?: () => void;
}

interface LocalAssetFilters {
  search?: string;
  sortField?: LocalAssetSortField;
  sortOrder?: LocalSortOrder;
  page?: number;
  pageSize?: number;
}

type ViewMode = 'grid' | 'list'

interface AssetFilters {
  search?: string;
  briefIds?: number[];
  commentIds?: number[];
  createdAt?: {
    start: string;
    end: string;
  };
  description?: string;
  mediaId?: number;
  name?: string;
  tagIds?: number[];
  thumbnailMediaId?: number;
}

export default function AssetList({ className }: AssetListProps) {
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortField, setSortField] = useState<LocalAssetSortField>("CREATED_AT")
  const [sortOrder, setSortOrder] = useState<LocalSortOrder>("DESC")
  const [loadedAssets, setLoadedAssets] = useState<IAsset[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  
  // Set up react-intersection-observer with options
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '0px 0px 400px 0px', // Load more content before user reaches the end
    triggerOnce: false
  });
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<IAsset | null>(null)

  const client = useApolloClient()

  const { data, loading: isLoading, fetchMore, refetch } = useGetAssetsQuery({
    variables: {
      filters: {
        search: search || undefined,
        mediaId: typeFilter !== "all" ? parseInt(typeFilter) : undefined,
      },
      sort: [
        {
          field: sortField,
          order: sortOrder
        }
      ],
      pagination: {
        page: currentPage,
        pageSize,
      },
    },
    fetchPolicy: 'network-only', // Force network request to avoid cache issues
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      console.log('Query completed with data:', data);
    },
    onError: (error) => {
      console.error('Query error:', error);
      toast({
        title: "Error",
        description: "Failed to load assets",
        variant: "destructive"
      });
    }
  });

  const processAssets = useCallback((assets: Array<any>) => {
    if (!assets || assets.length === 0) {
      console.log('No assets to process');
      return [];
    }
    
    console.log('Processing assets:', assets);
    
    return assets
      .filter((asset): asset is NonNullable<typeof asset> => {
        // Add extra logging for debugging
        if (!asset) {
          console.log('Filtered out null asset');
          return false;
        }
        return true;
      })
      .map(asset => {
        try {
          return {
            id: asset.id,
            name: asset.name || "",
            description: asset.description || "",
            media_id: asset.media?.id || 0,
            thumbnail_media_id: asset.thumbnail?.id || null,
            thumbnail: asset.thumbnail ? {
              id: asset.thumbnail.id,
              url: asset.thumbnail.url,
              file_type: asset.thumbnail.file_type
            } : undefined,
            url: asset.media?.url || "",
            fileType: asset.media?.file_type || "",
            tags: asset.tags?.map((tag: { id: number; name: string | null }) => tag ? {
              id: tag.id,
              name: tag.name || ''
            } : null).filter((tag: any): tag is { id: number; name: string } => tag !== null) || [],
            briefs: asset.briefs?.map((brief: { id: number; title: string | null }) => brief ? {
              id: brief.id,
              title: brief.title || ''
            } : null).filter((brief: any): brief is { id: number; title: string } => brief !== null) || [],
            relatedBriefs: asset.briefs?.map((brief: { id: number; title: string | null }) => brief ? {
              id: brief.id,
              title: brief.title || ''
            } : null).filter((brief: any): brief is { id: number; title: string } => brief !== null) || [],
            created_at: asset.created_at || "",
            updated_at: asset.updated_at || asset.created_at || ""
          } as IAsset;
        } catch (error) {
          console.error('Error processing asset:', error, asset);
          return null;
        }
      })
      .filter(asset => asset !== null) as IAsset[];
  }, []);

  useEffect(() => {
    console.log('Full data response:', data);
    
    if (data?.getAssets) {
      let assetsToProcess: any[] = [];
      
      // Handle different possible structures of the assets data
      if (data.getAssets.assets) {
        if (Array.isArray(data.getAssets.assets)) {
          assetsToProcess = data.getAssets.assets;
        } else if (typeof data.getAssets.assets === 'object') {
          // If it's an object with indices (like a GraphQL connection)
          assetsToProcess = Object.values(data.getAssets.assets);
        } else {
          console.error('Unexpected assets data structure:', data.getAssets.assets);
        }
      }
      
      console.log('Assets to process:', assetsToProcess);
      
      if (assetsToProcess.length > 0) {
        const processedAssets = processAssets(assetsToProcess);
        console.log('Processed assets:', processedAssets);
        
        if (currentPage === 1) {
          console.log('Setting assets (page 1):', processedAssets);
          setLoadedAssets(processedAssets);
        } else {
          setLoadedAssets(prev => {
            // Deduplicate assets when adding new ones
            const existingIds = new Set(prev.map(asset => asset.id));
            const uniqueNewAssets = processedAssets.filter(asset => !existingIds.has(asset.id));
            const newAssets = [...prev, ...uniqueNewAssets];
            console.log('Setting assets (additional page):', newAssets);
            return newAssets;
          });
        }
      } else {
        console.warn('No assets found in response');
        if (currentPage === 1) {
          setLoadedAssets([]);
        }
      }
    }
  }, [data, currentPage, processAssets]);

  // Reset loaded assets when search/filter/sort changes
  useEffect(() => {
    setLoadedAssets([]);
    setCurrentPage(1);
    setIsRefetching(true);
  }, [search, typeFilter, sortField, sortOrder]);
  
  const assets = loadedAssets;
  const totalCount = data?.getAssets?.totalCount || 0;
  const hasNextPage = data?.getAssets?.hasNextPage || false;

  // Debug the state right before rendering
  useEffect(() => {
    console.log('Assets state for rendering:', assets);
    console.log('isLoading:', isLoading);
    console.log('totalCount:', totalCount);
    console.log('hasNextPage:', hasNextPage);
  }, [assets, isLoading, totalCount, hasNextPage]);

  // Load more assets function
  const loadMoreAssets = useCallback(async () => {
    if (!hasNextPage || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = currentPage + 1;
      const response = await fetchMore({
        variables: {
          pagination: { page: nextPage, pageSize },
          filters: {
            search: search || undefined,
            mediaId: typeFilter !== "all" ? parseInt(typeFilter) : undefined,
          },
          sort: [{ field: sortField, order: sortOrder }]
        },
      });
      
      if (response && response.data) {
        setCurrentPage(nextPage);
        // Process and deduplicate new assets before adding them
        const newAssetsArray = Array.isArray(response.data.getAssets.assets) 
          ? response.data.getAssets.assets 
          : Array.from(response.data.getAssets.assets || []);
        
        const newAssets = processAssets(newAssetsArray);
        setLoadedAssets(prev => {
          const existingIds = new Set(prev.map(asset => asset.id));
          const uniqueNewAssets = newAssets.filter(asset => !existingIds.has(asset.id));
          return [...prev, ...uniqueNewAssets];
        });
        
        console.log('Loaded more assets:', newAssets);
      }
    } catch (error) {
      console.error("Error loading more assets:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, fetchMore, hasNextPage, isLoadingMore, pageSize, search, typeFilter, sortField, sortOrder, processAssets]);

  // Trigger load more when inView changes
  useEffect(() => {
    if (inView && !isLoadingMore && hasNextPage) {
      loadMoreAssets();
    }
  }, [inView, isLoadingMore, hasNextPage, loadMoreAssets]);

  // Function to refetch assets with reset page and cache
  const refetchAssets = useCallback(async () => {
    try {
      setCurrentPage(1);
      setLoadedAssets([]);
      setIsRefetching(true);
      
      // Evict and refetch for fresh data
      client.cache.evict({ fieldName: 'getAssets' });
      client.cache.gc();
      
      await refetch({
        pagination: { page: 1, pageSize },
        filters: {
          search: search || undefined,
          mediaId: typeFilter !== "all" ? parseInt(typeFilter) : undefined,
        },
        sort: [{ field: sortField, order: sortOrder }]
      });
      
      setIsRefetching(false);
    } catch (error) {
      console.error("Error refetching assets:", error);
      toast({
        title: "Error",
        description: "Failed to refresh assets",
        variant: "destructive"
      });
      setIsRefetching(false);
    }
  }, [client.cache, refetch, pageSize, search, typeFilter, sortField, sortOrder]);

  // Mutation for deleting assets
  const [deleteAsset, { loading: deleteLoading }] = useDeleteAssetMutation({
    onCompleted: () => {
      toast({
        title: "Success",
        description: "Asset deleted successfully"
      });
      refetchAssets();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete asset: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleSort = (field: LocalAssetSortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortField(field)
      setSortOrder('DESC')
    }
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value)
    setCurrentPage(1)
  }

  const handleCreateAsset = () => {
    setSelectedAssetId(null)
    setSelectedAsset(null)
    setIsCreateModalOpen(true)
  }

  const handleUpdateAsset = (assetId: number) => {
    setSelectedAssetId(assetId)
    setIsUpdateModalOpen(true)
    setIsCreateModalOpen(true)
  }

  const handlePreviewAsset = (assetId: number) => {
    setSelectedAssetId(assetId)
    setIsPreviewModalOpen(true)
  }

  const handleDeleteAsset = async (assetId: number) => {
    try {
      await deleteAsset({
        variables: { id: assetId },
      })
    } catch (error) {
      console.error("Error deleting asset:", error)
    }
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  const LoadingItems = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-square relative bg-muted">
            <Skeleton className="h-full w-full" />
          </div>
          <CardContent className="p-3">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const getAssetPreview = (asset: IAsset) => {
    if (!asset?.fileType) return null;

    if (asset.fileType.startsWith("image/")) {
      return asset.url;
    } else if (asset.fileType.startsWith("video/")) {
      return asset.thumbnail ? asset.thumbnail.url : null;
    }
    return null;
  };

  const renderGridView = () => {
    // Added console log to debug
    console.log('Rendering grid view with assets:', assets, 'length:', assets?.length, 'isRefetching:', isRefetching);
    
    // Only show full skeleton on initial load or when refetching
    if ((isLoading && currentPage === 1 && (!assets || assets.length === 0)) || isRefetching) {
      return <AssetGridSkeleton />
    }

    if ((!assets || assets.length === 0) && !isLoading && !isRefetching) {
      return (
        <div className="text-center py-12 border rounded-lg">
          <FileIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No assets found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Upload assets or adjust your filters to see results.</p>
          <Button onClick={handleCreateAsset} className="mt-4">
            <Upload className="mr-2 h-4 w-4" />
            Upload Asset
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map((asset: IAsset) => (
            <Card
              key={asset?.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handlePreviewAsset(asset?.id || 0)}
            >
              <div className="aspect-square relative bg-muted">
                {getAssetPreview(asset) ? (
                  <Image
                    src={getAssetPreview(asset) || ""}
                    alt={asset?.name || ""}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <FileIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {asset?.fileType?.startsWith("video/") && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="truncate font-medium text-sm">{asset?.name}</div>
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
                          setSelectedAsset(asset)
                          handleUpdateAsset(asset?.id || 0)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteAsset(asset?.id || 0)
                        }}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <div>{formatDate(asset?.created_at || "")}</div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {asset?.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag?.id} variant="secondary" className="text-xs">
                      {tag?.name}
                    </Badge>
                  ))}
                  {(asset?.tags?.length || 0) > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{(asset?.tags?.length || 0) - 2}
                    </Badge>
                  )}
                </div>
                {asset?.briefs && asset.briefs.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">Linked Briefs:</div>
                    <div className="flex flex-wrap gap-1">
                      {asset.briefs.slice(0, 2).map((brief) => (
                        <Badge key={brief?.id} variant="outline" className="text-xs">
                          {brief?.title || `Brief ${brief?.id}`}
                        </Badge>
                      ))}
                      {(asset?.briefs?.length || 0) > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(asset?.briefs?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        {hasNextPage && (
          <div ref={loadMoreRef} className="py-4 text-center">
            {(isLoading && currentPage > 1) || isLoadingMore ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Loading more assets...</p>
              </div>
            ) : (
              <div className="h-8">
                {/* Invisible spacer for intersection observer */}
              </div>
            )}
          </div>
        )}
        {!hasNextPage && assets.length > 0 && (
          <p className="text-center text-muted-foreground py-4">
            {totalCount === assets.length ? (
              <span>Showing all {assets.length} assets</span>
            ) : (
              <span>Showing {assets.length} of {totalCount} assets</span>
            )}
          </p>
        )}
      </div>
    )
  }

  const renderListView = () => {
    // Added console log to debug
    console.log('Rendering list view with assets:', assets, 'length:', assets?.length, 'isRefetching:', isRefetching);
    
    // Only show full skeleton on initial load or when refetching
    if ((isLoading && currentPage === 1 && (!assets || assets.length === 0)) || isRefetching) {
      return <AssetListSkeleton />
    }
    
    if ((!assets || assets.length === 0) && !isLoading && !isRefetching) {
      return (
        <div className="text-center py-12 border rounded-lg">
          <FileIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No assets found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Upload assets or adjust your filters to see results.</p>
          <Button onClick={handleCreateAsset} className="mt-4">
            <Upload className="mr-2 h-4 w-4" />
            Upload Asset
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium cursor-pointer"
                    onClick={() => handleSort('NAME')}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {sortField === 'NAME' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium cursor-pointer"
                    onClick={() => handleSort('CREATED_AT')}
                  >
                    <div className="flex items-center gap-2">
                      Created
                      {sortField === 'CREATED_AT' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="h-12 px-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {assets.map((asset: IAsset) => (
                  <tr key={asset?.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-muted rounded flex items-center justify-center relative">
                          {getAssetPreview(asset) ? (
                            <Image
                              src={getAssetPreview(asset) || ""}
                              alt={asset?.name || ""}
                              width={32}
                              height={32}
                              className="rounded object-cover"
                            />
                          ) : (
                            <FileIcon className="h-4 w-4" />
                          )}
                          {asset?.fileType?.startsWith("video/") && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{asset?.name}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="outline">{asset?.fileType?.split("/")[1] || "unknown"}</Badge>
                    </td>
                    <td className="p-4 align-middle">
                      {formatDate(asset?.created_at || "")}
                    </td>
                    <td className="p-4 align-middle">
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
                              setSelectedAsset(asset)
                              handleUpdateAsset(asset?.id || 0)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteAsset(asset?.id || 0)
                            }}
                            className="text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {hasNextPage && (
          <div ref={loadMoreRef} className="py-4 text-center">
            {(isLoading && currentPage > 1) || isLoadingMore ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Loading more assets...</p>
              </div>
            ) : (
              <div className="h-8">
                {/* Invisible spacer for intersection observer */}
              </div>
            )}
          </div>
        )}
        {!hasNextPage && assets.length > 0 && (
          <p className="text-center text-muted-foreground py-4">
            {totalCount === assets.length ? (
              <span>Showing all {assets.length} assets</span>
            ) : (
              <span>Showing {assets.length} of {totalCount} assets</span>
            )}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className || ""}`}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} disabled={isLoading}>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(value: string) => handleViewModeChange(value as ViewMode)}>
            <TabsList>
              <TabsTrigger value="grid">
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="text-sm ml-4">
            <span className="font-medium">Sort by: </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`${sortField === 'NAME' ? 'font-medium underline' : ''}`}
              onClick={() => handleSort('NAME')}
            >
              Name
              {sortField === 'NAME' && (
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
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {isLoading && currentPage === 1 ? "Loading..." : `${totalCount} asset${totalCount !== 1 ? "s" : ""}`}
        </div>
      </div>

      {viewMode === "grid" ? renderGridView() : renderListView()}

      <AssetModal
        isOpen={isCreateModalOpen}
        onClose={async () => {
          setIsCreateModalOpen(false)
          setSelectedAsset(null)
          setSelectedAssetId(null)
          
          // Reset to first page
          setCurrentPage(1)
          setLoadedAssets([])
          
          // Clear cache to ensure fresh data
          try {
            await refetchAssets()
          } catch (error) {
            console.error('Error refreshing assets:', error)
          }
        }}
        asset={selectedAsset}
        onSave={async (asset) => {
          try {
            setIsCreateModalOpen(false)
            setSelectedAsset(null)
            setSelectedAssetId(null)
            
            // Reset to first page
            setCurrentPage(1)
            setLoadedAssets([])
            
            // Refetch fresh data
            await refetchAssets()
            
            toast({
              title: "Success",
              description: asset ? `Asset "${asset.name}" updated` : "Asset created"
            })
          } catch (error) {
            console.error('Error refreshing assets:', error)
            toast({
              title: "Error",
              description: "Failed to refresh asset list",
              variant: "destructive",
            })
          }
        }}
      />

      <AssetPreviewModal
        assetId={selectedAssetId}
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false)
          setSelectedAssetId(null)
        }}
        onEdit={(asset) => {
          setSelectedAssetId(asset.id);
          setSelectedAsset(asset);
          setIsCreateModalOpen(true);
          setIsPreviewModalOpen(false);
        }}
      />
    </div>
  )
}
