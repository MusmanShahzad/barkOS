"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileIcon, Grid, List, Plus, Search, X, FileImage, Play } from "lucide-react"
import { formatFileSize } from "@/lib/utils"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { VirtualList } from "@/components/virtual-list"
import AssetPreviewModal from "@/components/asset-preview-modal"
import { useGetAssetsQuery, Asset, Maybe } from "@/src/graphql/generated/graphql"
import { AssetModal, IAsset } from "@/components/asset-modal"
import { toast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"
import { useApolloClient } from "@apollo/client"

// Define interfaces for component props
interface QuickAssetSelectorProps {
  selectedAssets: IAsset[];
  onSelect: (assets: IAsset[]) => void;
  onAddNew: () => void;
}

export function QuickAssetSelector({
  selectedAssets = [],
  onSelect,
  onAddNew
}: QuickAssetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [viewMode, setViewMode] = useState("grid")
  const [localSelectedAssets, setLocalSelectedAssets] = useState<IAsset[]>(selectedAssets)
  const [isOpen, setIsOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [previewAsset, setPreviewAsset] = useState<number | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<IAsset | null>(null)
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null)
  const PAGE_SIZE = 10
  
  // Accumulated assets state (similar to loadedBriefs in brief-list.tsx)
  const [accumulatedAssets, setAccumulatedAssets] = useState<IAsset[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const client = useApolloClient()

  // Query assets using GraphQL
  const { data, loading, fetchMore, refetch } = useGetAssetsQuery({
    variables: {
      pagination: {
        page,
        pageSize: PAGE_SIZE
      },
      filters: {
        search: debouncedSearchQuery || undefined
      },
      sort: [
        {
          field: "CREATED_AT",
          order: "DESC"
        }
      ]
    },
    skip: !isOpen,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network'
  })

  // Update local state when props change
  useEffect(() => {
    setLocalSelectedAssets(selectedAssets)
  }, [selectedAssets])

  // Reset pagination when modal opens
  useEffect(() => {
    if (isOpen) {
      setPage(1)
      setAccumulatedAssets([])
    }
  }, [isOpen])

  // Handle search query changes
  useEffect(() => {
    if (isOpen && debouncedSearchQuery !== undefined) {
      // Reset to page 1 when search changes
      setPage(1)
      setAccumulatedAssets([])
      
      // Refetch data with new search parameters
      refetch({
        pagination: {
          page: 1,
          pageSize: PAGE_SIZE
        },
        filters: {
          search: debouncedSearchQuery || undefined
        },
        sort: [
          {
            field: "CREATED_AT",
            order: "DESC"
          }
        ]
      })
    }
  }, [debouncedSearchQuery, isOpen, refetch])

  const mapAssetsFromApi = useCallback((apiAssets: readonly any[]): IAsset[] => {
    if (!apiAssets || !Array.isArray(apiAssets)) return []
    
    return apiAssets
      .filter(asset => asset !== null)
      .map((asset): IAsset => {
        return {
          id: Number(asset.id),
          name: asset.name || `Asset ${asset.id}`,
          description: asset.description || "",
          media_id: Number(asset.media?.id || 0),
          thumbnail_media_id: asset.thumbnail?.id || null,
          created_at: asset.created_at || "",
          url: asset.media?.url ?? "/placeholder.svg",
          fileType: asset.media?.file_type ?? "application/octet-stream", 
          thumbnail: asset.thumbnail ? {
            id: asset.thumbnail.id,
            url: asset.thumbnail.url || "",
            file_type: asset.thumbnail.file_type || ""
          } : undefined,
          tags: asset.tags?.filter(Boolean).map((tag: any) => ({
            id: Number(tag?.id || 0),
            name: tag?.name || ''
          })) || [],
          briefs: asset.briefs?.filter(Boolean).map((brief: any) => ({
            id: Number(brief?.id || 0),
            title: brief?.title || ''
          })) || [],
          relatedBriefs: asset.briefs?.filter(Boolean).map((brief: any) => ({
            id: Number(brief?.id || 0),
            title: brief?.title || ''
          })) || [],
          updated_at: asset.created_at || ""
        }
      })
  }, [])
  // Process assets data when it arrives (similar to the briefs processor in brief-list)
  useEffect(() => {
    if (data?.getAssets?.assets) {
      // Convert API assets to IAsset format
      const processedAssets = mapAssetsFromApi(data.getAssets.assets as any);
      
      if (page === 1) {
        setAccumulatedAssets(processedAssets);
      } else {
        setAccumulatedAssets(prev => {
          // Deduplicate assets when adding new ones
          const existingIds = new Set(prev.map(asset => asset.id));
          const uniqueNewAssets = processedAssets.filter(asset => !existingIds.has(asset.id));
          return [...prev, ...uniqueNewAssets];
        });
      }
      
      setIsLoadingMore(false);
    }
  }, [data?.getAssets?.assets, page, mapAssetsFromApi]);

  // Convert API assets to IAsset format


  // Get hasNextPage and totalCount from data
  const hasMoreAssets = data?.getAssets?.hasNextPage || false
  const totalAssets = data?.getAssets?.totalCount || 0

  // Load more assets function
  const loadMoreAssets = useCallback(() => {
    if (loading || !hasMoreAssets || isLoadingMore) return
    
    setIsLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    
    fetchMore({
      variables: {
        pagination: {
          page: nextPage,
          pageSize: PAGE_SIZE
        },
        filters: {
          search: debouncedSearchQuery || undefined
        }
      }
    }).catch(error => {
      setIsLoadingMore(false)
      console.error("Error loading more assets:", error)
    })
  }, [loading, hasMoreAssets, isLoadingMore, page, fetchMore, debouncedSearchQuery])

  // Refresh the asset data
  const refreshAssets = async () => {
    // Reset page and accumulated assets
    setPage(1)
    setAccumulatedAssets([])
    
    // Clear cache to ensure fresh data
    client.cache.evict({ fieldName: 'getAssets' })
    client.cache.gc()
    
    await refetch({
      pagination: {
        page: 1,
        pageSize: PAGE_SIZE
      },
      filters: {
        search: debouncedSearchQuery || undefined
      }
    })
  }

  // Toggle asset selection
  const toggleAssetSelection = (assetId: number) => {
    // Find the asset in available assets
    const asset = accumulatedAssets.find(a => a.id === assetId)
    
    // If asset is not found, do nothing
    if (!asset) return
    
    // Check if asset is already selected
    const isSelected = localSelectedAssets.some(a => a.id === assetId)
    
    // Create new selection array
    const newSelection = isSelected
      ? localSelectedAssets.filter(a => a.id !== assetId)
      : [...localSelectedAssets, asset]
    
    // Update local state
    setLocalSelectedAssets(newSelection)
    
    // Call onSelect prop with new selection
    onSelect(newSelection)
  }

  // Get the file type for display
  const getFileType = (asset: IAsset): string => {
    if (!asset.fileType) return "unknown";
    return asset.fileType.split('/')[0];
  }

  // Get preview URL based on asset type
  const getAssetPreview = (asset: IAsset): string => {
    if (!asset.fileType) return "/placeholder.svg";
    
    if (asset.fileType.startsWith("image/")) {
      return asset.url || "/placeholder.svg";
    } else if (asset.fileType.startsWith("video/")) {
      // Try to get thumbnail directly from the asset
      if (asset.thumbnail?.url) {
        return asset.thumbnail.url;
      }
      // If no specific thumbnail is available, return a video placeholder
      return "/placeholder.svg?query=video thumbnail";
    }
    return "/placeholder.svg";
  };

  // Open asset preview
  const openAssetPreview = (assetId: number) => {
    setPreviewAsset(assetId)
    setIsPreviewOpen(true)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Render grid item
  const renderGridItem = (asset: IAsset) => (
    <Card
      key={asset.id}
      className={`overflow-hidden cursor-pointer hover:bg-muted transition-colors ${
        localSelectedAssets.some(a => a.id === asset.id) ? "ring-1 ring-primary" : ""
      }`}
    >
      <div className="aspect-square relative bg-muted" onClick={() => openAssetPreview(asset.id)}>
        {asset.fileType?.startsWith("image/") ? (
          <Image src={asset.url || "/placeholder.svg"} alt={asset.name || ""} fill className="object-cover" />
        ) : asset.fileType?.startsWith("video/") ? (
          <div className="w-full h-full relative">
            <Image
              src={getAssetPreview(asset)}
              alt={asset.name || ""}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-black/60 flex items-center justify-center">
                <Play className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div
          className="absolute top-1 left-1"
          onClick={(e) => {
            e.stopPropagation()
            toggleAssetSelection(asset.id)
          }}
        >
          <Checkbox checked={localSelectedAssets.some(a => a.id === asset.id)} className="h-4 w-4 bg-background/80" />
        </div>
      </div>
      <CardContent className="p-2">
        <div className="truncate text-xs font-medium">{asset.name}</div>
        <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
          <Badge variant="outline" className="text-[10px] h-4 px-1">
            {getFileType(asset)}
          </Badge>
          <span>{formatFileSize(0)}</span>
        </div>
      </CardContent>
    </Card>
  )

  // Render list item
  const renderListItem = (asset: IAsset) => (
    <div
      key={asset.id}
      className={`flex items-center p-2 hover:bg-muted cursor-pointer ${
        localSelectedAssets.some(a => a.id === asset.id) ? "bg-muted/70" : ""
      }`}
    >
      <div
        className="flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation()
          toggleAssetSelection(asset.id)
        }}
      >
        <Checkbox checked={localSelectedAssets.some(a => a.id === asset.id)} className="mr-2" />
      </div>
      <div className="flex-1 flex items-center min-w-0" onClick={() => openAssetPreview(asset.id)}>
        <div className="h-8 w-8 mr-2 rounded overflow-hidden bg-muted flex-shrink-0">
          {asset.fileType?.startsWith("image/") ? (
            <Image
              src={asset.url || "/placeholder.svg"}
              alt={asset.name || ""}
              width={32}
              height={32}
              className="object-cover h-full w-full"
            />
          ) : asset.fileType?.startsWith("video/") ? (
            <div className="relative h-full w-full">
              <Image
                src={getAssetPreview(asset)}
                alt={asset.name || ""}
                width={32}
                height={32}
                className="object-cover h-full w-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-3 w-3 text-white" />
              </div>
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <FileIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-xs truncate">{asset.name}</div>
          <div className="text-[10px] text-muted-foreground">{formatFileSize(0)}</div>
        </div>
      </div>
      <Badge variant="outline" className="ml-2 text-[10px]">
        {getFileType(asset)}
      </Badge>
    </div>
  )

  // Define grid item skeleton loader
  const renderGridItemSkeleton = () => (
    <Card className="overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted/50"></div>
      <CardContent className="p-2">
        <div className="h-3 w-3/4 bg-muted/70 rounded mb-1"></div>
        <div className="flex items-center justify-between mt-1">
          <div className="h-3 w-10 bg-muted/50 rounded"></div>
          <div className="h-3 w-8 bg-muted/50 rounded"></div>
        </div>
      </CardContent>
    </Card>
  )

  // Define list item skeleton loader
  const renderListItemSkeleton = () => (
    <div className="flex items-center p-2 animate-pulse">
      <div className="h-4 w-4 bg-muted/50 rounded mr-2"></div>
      <div className="h-8 w-8 mr-2 rounded bg-muted/50"></div>
      <div className="flex-1 min-w-0">
        <div className="h-3 w-3/4 bg-muted/70 rounded mb-1"></div>
        <div className="h-2 w-1/2 bg-muted/50 rounded"></div>
      </div>
      <div className="h-4 w-12 bg-muted/50 rounded ml-2"></div>
    </div>
  )

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Popover 
          open={isOpen} 
          onOpenChange={(open) => {
            setIsOpen(open);
            if (open) {
              // On open, reset state and refetch data
              setPage(1);
              setSearchQuery("");
              setAccumulatedAssets([]);
              
              // Wait for state updates to apply then refetch
              setTimeout(() => {
                refetch({
                  pagination: {
                    page: 1,
                    pageSize: PAGE_SIZE
                  },
                  filters: {
                    search: ""
                  }
                });
              }, 0);
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex-1 justify-between">
              <div className="flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                <span>
                  {localSelectedAssets.length === 0
                    ? "Select Assets"
                    : `${localSelectedAssets.length} Asset${localSelectedAssets.length !== 1 ? "s" : ""} Selected`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {localSelectedAssets.length > 0 && (
                  <div
                    className="h-5 w-5 rounded-full inline-flex items-center justify-center hover:bg-muted/60"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect([]);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </div>
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0" align="start">
            <div className="p-3 border-b">
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <Button type="button" size="sm" variant="ghost" onClick={onAddNew}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <Tabs defaultValue="grid">
                  <TabsList className="h-8">
                    <TabsTrigger value="grid" className="px-2 h-7 overflow-auto" onClick={() => setViewMode("grid")}>
                      <Grid className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="list" className="px-2 h-7" onClick={() => setViewMode("list")}>
                      <List className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="text-xs text-muted-foreground">
                  {totalAssets} asset{totalAssets !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="p-2 h-[300px] overflow-auto" 
                onScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  if (
                    !loading && 
                    !isLoadingMore &&
                    hasMoreAssets && 
                    target.scrollHeight - target.scrollTop <= target.clientHeight + 100
                  ) {
                    loadMoreAssets();
                  }
                }}
              >
                {loading && accumulatedAssets.length === 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i}>{renderGridItemSkeleton()}</div>
                    ))}
                  </div>
                ) : accumulatedAssets.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground text-sm">No assets found</div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {accumulatedAssets.map((asset) => renderGridItem(asset))}
                    </div>
                    
                    {/* Bottom loader */}
                    {hasMoreAssets && (
                      <div className="flex items-center justify-center p-2 mt-2 h-10">
                        {(loading || isLoadingMore) && (
                          <div className="flex items-center justify-center space-x-1">
                            <div className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* End of results message */}
                    {!hasMoreAssets && accumulatedAssets.length > 0 && (
                      <div className="py-2 text-center text-xs text-muted-foreground">
                        {totalAssets === accumulatedAssets.length ? (
                          <span>Showing all {totalAssets} assets</span>
                        ) : (
                          <span>End of results</span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="h-[300px]">
                {loading && accumulatedAssets.length === 0 ? (
                  <div className="flex flex-col">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i}>{renderListItemSkeleton()}</div>
                    ))}
                  </div>
                ) : accumulatedAssets.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground text-sm">No assets found</div>
                  </div>
                ) : (
                  <div className="overflow-auto h-full pb-2" 
                    onScroll={(e) => {
                      const target = e.target as HTMLDivElement;
                      if (
                        !loading && 
                        !isLoadingMore &&
                        hasMoreAssets && 
                        target.scrollHeight - target.scrollTop <= target.clientHeight + 100
                      ) {
                        loadMoreAssets();
                      }
                    }}
                  >
                    {accumulatedAssets.map(asset => renderListItem(asset))}
                    
                    {/* Bottom loader */}
                    {hasMoreAssets && (
                      <div className="flex items-center justify-center p-2 h-10">
                        {(loading || isLoadingMore) && (
                          <div className="flex items-center justify-center space-x-1">
                            <div className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* End of results message */}
                    {!hasMoreAssets && accumulatedAssets.length > 0 && (
                      <div className="py-2 text-center text-xs text-muted-foreground">
                        {totalAssets === accumulatedAssets.length ? (
                          <span>Showing all {totalAssets} assets</span>
                        ) : (
                          <span>End of results</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected assets preview */}
      {localSelectedAssets.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {localSelectedAssets.map((asset) => (
            <Badge key={asset.id} variant="secondary" className="flex items-center gap-1 pr-1">
              {asset.fileType?.startsWith("image/") ? (
                <div className="w-3 h-3 rounded-full overflow-hidden mr-1">
                  <Image
                    src={asset.url || "/placeholder.svg"}
                    alt={asset.name || ""}
                    width={12}
                    height={12}
                    className="object-cover"
                  />
                </div>
              ) : asset.fileType?.startsWith("video/") ? (
                <div className="w-3 h-3 rounded-full overflow-hidden mr-1 relative">
                  <Image
                    src={getAssetPreview(asset)}
                    alt={asset.name || ""}
                    width={12}
                    height={12}
                    className="object-cover"
                  />
                </div>
              ) : (
                <FileIcon className="w-3 h-3 mr-1" />
              )}
              <span className="text-xs max-w-[100px] truncate">{asset.name}</span>
              <div
                className="h-4 w-4 p-0 ml-1 rounded-full inline-flex items-center justify-center hover:bg-muted/60 cursor-pointer"
                onClick={() => toggleAssetSelection(asset.id)}
              >
                <X className="h-3 w-3" />
              </div>
            </Badge>
          ))}
        </div>
      )}

      {/* Asset preview modal */}
      <AssetPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} 
      onEdit={(editAsset) => {
        setSelectedAsset(editAsset)
        setSelectedAssetId(editAsset.id)
        setIsCreateModalOpen(true)
      }} assetId={previewAsset} />
      <AssetModal
        isOpen={isCreateModalOpen}
        onClose={async () => {
          setIsCreateModalOpen(false)
          setSelectedAsset(null)
          setSelectedAssetId(null)
          await refreshAssets();
        }}
        asset={selectedAsset}
        onSave={async (asset) => {
          try {
            setIsCreateModalOpen(false);
            setSelectedAsset(null)
            // Refresh assets after saving
            await refreshAssets();
          } catch (error) {
            console.error('Error refreshing assets:', error);
            toast({
              title: "Error",
              description: "Failed to refresh asset list",
              variant: "destructive",
            });
          }
        }}
      />
    </div>
  )
}
