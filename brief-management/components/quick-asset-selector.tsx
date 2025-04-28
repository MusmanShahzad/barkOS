"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileIcon, Grid, List, Plus, Search, X, Upload, FileImage, Loader2, Play } from "lucide-react"
import { formatFileSize } from "@/lib/utils"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { VirtualList } from "@/components/virtual-list"
import AssetPreviewModal from "@/components/asset-preview-modal"
import { useGetAssetsQuery, Asset, Maybe } from "@/src/graphql/generated/graphql"

// Define interfaces for component props and assets
export interface AssetDisplayType {
  id: number;
  name: string;
  description?: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string | null;
  tags?: string[];
}

interface QuickAssetSelectorProps {
  selectedAssets: AssetDisplayType[];
  onSelect: (assets: AssetDisplayType[]) => void;
  onAddNew: () => void;
}

export function QuickAssetSelector({
  selectedAssets = [],
  onSelect,
  onAddNew
}: QuickAssetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [localSelectedAssets, setLocalSelectedAssets] = useState<AssetDisplayType[]>(selectedAssets)
  const [isOpen, setIsOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [previewAsset, setPreviewAsset] = useState<number | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const PAGE_SIZE = 10

  // Query assets using GraphQL
  const { data, loading, fetchMore } = useGetAssetsQuery({
    variables: {
      pagination: {
        page,
        pageSize: PAGE_SIZE
      },
      filters: {
        search: searchQuery || undefined
      },
      sort: [
        {
          field: "CREATED_AT",
          order: "DESC"
        }
      ]
    },
    skip: !isOpen // Only fetch when popover is open
  })

  // Update local state when props change
  useEffect(() => {
    setLocalSelectedAssets(selectedAssets)
  }, [selectedAssets])

  // Convert API assets to display format
  const mapAssetsFromApi = (assets: Maybe<Asset>[]): AssetDisplayType[] => {
    return assets
      .filter((asset): asset is Asset => asset !== null)
      .map((asset): AssetDisplayType => {
        return {
          id: Number(asset.id),
          name: asset.name || `Asset ${asset.id}`,
          description: asset.description || undefined,
          // Determine type from media file_type
          type: asset.media?.file_type?.split('/')[0] || "file",
          // Use placeholder size if not available
          size: 0,
          // Get URL from media
          url: asset.media?.url || "/placeholder.svg",
          // Get thumbnail URL if available
          thumbnail: asset.thumbnail?.url || null,
          // Get tags
          tags: asset.tags?.filter(Boolean).map(tag => tag?.name || '') || []
        }
      })
  }

  // Available assets data
  const availableAssets = mapAssetsFromApi(data?.getAssets.assets || [])
  const hasMoreAssets = data?.getAssets.hasNextPage || false
  const totalAssets = data?.getAssets.totalCount || 0

  // Load more assets
  const loadMoreAssets = () => {
    if (loading || !hasMoreAssets) return

    const nextPage = page + 1
    fetchMore({
      variables: {
        pagination: {
          page: nextPage,
          pageSize: PAGE_SIZE
        }
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev
        return {
          ...fetchMoreResult,
          getAssets: {
            ...fetchMoreResult.getAssets,
            assets: [
              ...(prev.getAssets.assets || []),
              ...(fetchMoreResult.getAssets.assets || [])
            ]
          }
        }
      }
    })
    setPage(nextPage)
  }

  // Toggle asset selection
  const toggleAssetSelection = (assetId: number) => {
    // Find the asset in available assets
    const asset = availableAssets.find(a => a.id === assetId)
    
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

  // Open asset preview
  const openAssetPreview = (assetId: number) => {
    setPreviewAsset(assetId)
    setIsPreviewOpen(true)
  }

  // Render grid item
  const renderGridItem = (asset: AssetDisplayType) => (
    <Card
      key={asset.id}
      className={`overflow-hidden cursor-pointer hover:bg-muted transition-colors ${
        localSelectedAssets.some(a => a.id === asset.id) ? "ring-1 ring-primary" : ""
      }`}
    >
      <div className="aspect-square relative bg-muted" onClick={() => openAssetPreview(asset.id)}>
        {asset.type === "image" ? (
          <Image src={asset.url || "/placeholder.svg"} alt={asset.name} fill className="object-cover" />
        ) : asset.type === "video" ? (
          <div className="w-full h-full relative">
            <Image
              src={asset.thumbnail || "/placeholder.svg?query=video thumbnail"}
              alt={asset.name}
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
            {asset.type}
          </Badge>
          <span>{formatFileSize(asset.size)}</span>
        </div>
      </CardContent>
    </Card>
  )

  // Render list item
  const renderListItem = (asset: AssetDisplayType) => (
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
          {asset.type === "image" ? (
            <Image
              src={asset.url || "/placeholder.svg"}
              alt={asset.name}
              width={32}
              height={32}
              className="object-cover h-full w-full"
            />
          ) : asset.type === "video" ? (
            <div className="relative h-full w-full">
              <Image
                src={asset.thumbnail || "/placeholder.svg?query=video thumbnail"}
                alt={asset.name}
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
          <div className="text-[10px] text-muted-foreground">{formatFileSize(asset.size)}</div>
        </div>
      </div>
      <Badge variant="outline" className="ml-2 text-[10px]">
        {asset.type}
      </Badge>
    </div>
  )

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect([])
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="sm" variant="ghost" onClick={onAddNew}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <Tabs defaultValue="grid">
                  <TabsList className="h-8">
                    <TabsTrigger value="grid" className="px-2 h-7" onClick={() => setViewMode("grid")}>
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
              <div className="p-2">
                {loading && availableAssets.length === 0 ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading assets...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">{availableAssets.map((asset) => renderGridItem(asset))}</div>
                    {loading && (
                      <div className="flex items-center justify-center p-2 mt-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-xs">Loading more...</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <VirtualList
                items={availableAssets}
                renderItem={renderListItem}
                itemHeight={48}
                height={300}
                hasMore={hasMoreAssets}
                loadMore={loadMoreAssets}
                isLoading={loading}
                emptyMessage={
                  loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading assets...</span>
                    </div>
                  ) : (
                    "No assets found"
                  )
                }
              />
            )}
          </PopoverContent>
        </Popover>
        <Button size="icon" variant="outline" onClick={onAddNew}>
          <Upload className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected assets preview */}
      {localSelectedAssets.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {localSelectedAssets.map((asset) => (
            <Badge key={asset.id} variant="secondary" className="flex items-center gap-1 pr-1">
              {asset.type === "image" ? (
                <div className="w-3 h-3 rounded-full overflow-hidden mr-1">
                  <Image
                    src={asset.url || "/placeholder.svg"}
                    alt={asset.name}
                    width={12}
                    height={12}
                    className="object-cover"
                  />
                </div>
              ) : asset.type === "video" ? (
                <div className="w-3 h-3 rounded-full overflow-hidden mr-1 relative">
                  <Image
                    src={asset.thumbnail || "/placeholder.svg?query=video thumbnail"}
                    alt={asset.name}
                    width={12}
                    height={12}
                    className="object-cover"
                  />
                </div>
              ) : (
                <FileIcon className="w-3 h-3 mr-1" />
              )}
              <span className="text-xs max-w-[100px] truncate">{asset.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 rounded-full"
                onClick={() => toggleAssetSelection(asset.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Asset preview modal */}
      <AssetPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} assetId={previewAsset} />
    </div>
  )
}
