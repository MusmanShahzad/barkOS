"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileIcon, Grid, List, MoreHorizontal, Upload } from "lucide-react"
import { mockAssets } from "@/lib/mock-data"
import { formatDate, formatFileSize } from "@/lib/utils"
import AssetModal from "@/components/asset-modal"
import AssetPreviewModal from "@/components/asset-preview-modal"
import Image from "next/image"
import { SortableTable } from "@/components/sortable-table"
import { TokenizedSelect } from "@/components/tokenized-select"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function AssetList() {
  const [assets, setAssets] = useState([])
  const [filteredAssets, setFilteredAssets] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [editingAsset, setEditingAsset] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [previewAsset, setPreviewAsset] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    // Simulate loading data
    setIsLoading(true)
    const timer = setTimeout(() => {
      setAssets(mockAssets)
      setFilteredAssets(mockAssets)
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    filterAssets()
  }, [searchQuery, typeFilter, assets])

  const filterAssets = () => {
    if (assets.length === 0) return

    let result = [...assets]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query) ||
          asset.description?.toLowerCase().includes(query) ||
          asset.tags?.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((asset) => asset.type === typeFilter)
    }

    setFilteredAssets(result)
  }

  const handleEditAsset = (asset) => {
    setEditingAsset(asset)
    setIsModalOpen(true)
  }

  const handleCreateAsset = () => {
    setEditingAsset(null)
    setIsModalOpen(true)
  }

  const handleSaveAsset = (updatedAsset) => {
    if (updatedAsset.id) {
      // Update existing asset
      setAssets(assets.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset)))
    } else {
      // Create new asset
      const newAsset = {
        ...updatedAsset,
        id: Date.now().toString(),
        createdAt: new Date(),
      }
      setAssets([...assets, newAsset])
    }
    setIsModalOpen(false)
    setEditingAsset(null)
  }

  const handleDeleteAsset = (assetId) => {
    setAssets(assets.filter((asset) => asset.id !== assetId))
  }

  const handlePreviewAsset = (asset) => {
    setPreviewAsset(asset.id)
    setIsPreviewOpen(true)
  }

  const renderGridView = () => {
    if (isLoading) {
      return <AssetGridSkeleton />
    }

    if (filteredAssets.length === 0) {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredAssets.map((asset) => (
          <Card
            key={asset.id}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handlePreviewAsset(asset)}
          >
            <div className="aspect-square relative bg-muted">
              {asset.type === "image" ? (
                <Image src={asset.url || "/placeholder.svg"} alt={asset.name} fill className="object-cover" />
              ) : asset.type === "video" ? (
                <div className="w-full h-full relative">
                  <Image
                    src={asset.thumbnail || "/placeholder.svg?height=200&width=200&query=video thumbnail"}
                    alt={asset.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-black/60 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                        <path
                          fillRule="evenodd"
                          d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="truncate font-medium text-sm">{asset.name}</div>
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
                        handleEditAsset(asset)
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteAsset(asset.id)
                      }}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <div>{formatFileSize(asset.size)}</div>
                <div>{formatDate(asset.createdAt)}</div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {asset.tags?.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {asset.tags?.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{asset.tags.length - 2}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderListView = () => {
    if (isLoading) {
      return <AssetListSkeleton />
    }

    return (
      <SortableTable
        data={filteredAssets}
        columns={[
          {
            id: "name",
            header: "Name",
            cell: (asset) => (
              <div className="flex items-center gap-2">
                {asset.type === "image" ? (
                  <div className="h-8 w-8 rounded overflow-hidden bg-muted relative">
                    <Image src={asset.url || "/placeholder.svg"} alt={asset.name} fill className="object-cover" />
                  </div>
                ) : asset.type === "video" ? (
                  <div className="h-8 w-8 rounded overflow-hidden bg-muted relative">
                    <Image
                      src={asset.thumbnail || "/placeholder.svg?height=32&width=32&query=video thumbnail"}
                      alt={asset.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                        <path
                          fillRule="evenodd"
                          d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                    <FileIcon className="h-4 w-4" />
                  </div>
                )}
                <span className="font-medium">{asset.name}</span>
              </div>
            ),
            sortable: true,
            sortingFn: (a, b) => a.name.localeCompare(b.name),
          },
          {
            id: "type",
            header: "Type",
            cell: (asset) => <Badge variant="outline">{asset.type}</Badge>,
            sortable: true,
            sortingFn: (a, b) => a.type.localeCompare(b.type),
          },
          {
            id: "size",
            header: "Size",
            cell: (asset) => formatFileSize(asset.size),
            sortable: true,
            sortingFn: (a, b) => a.size - b.size,
          },
          {
            id: "createdBy",
            header: "Created By",
            cell: (asset) => (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={asset.createdBy?.avatar || "/placeholder.svg"} alt={asset.createdBy?.name} />
                  <AvatarFallback>{asset.createdBy?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{asset.createdBy?.name}</span>
              </div>
            ),
            sortable: true,
            sortingFn: (a, b) => a.createdBy?.name.localeCompare(b.createdBy?.name || "") || 0,
          },
          {
            id: "createdAt",
            header: "Created",
            cell: (asset) => formatDate(asset.createdAt),
            sortable: true,
            sortingFn: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          },
          {
            id: "relatedBriefs",
            header: "Related Tasks",
            cell: (asset) =>
              asset.relatedBriefs?.length ? (
                <Badge variant="secondary">{asset.relatedBriefs.length} briefs</Badge>
              ) : (
                <span className="text-muted-foreground">None</span>
              ),
            sortable: true,
            sortingFn: (a, b) => (a.relatedBriefs?.length || 0) - (b.relatedBriefs?.length || 0),
          },
          {
            id: "actions",
            header: "",
            cell: (asset) => (
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
                      handlePreviewAsset(asset)
                    }}
                  >
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditAsset(asset)
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteAsset(asset.id)
                    }}
                    className="text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        onRowClick={(asset) => handlePreviewAsset(asset)}
        isLoading={isLoading}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <TokenizedSelect
          placeholder="Search assets..."
          options={assets.map((asset) => ({
            value: asset.id,
            label: asset.name,
            icon:
              asset.type === "image" ? (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded overflow-hidden bg-muted">
                  <img src={asset.url || "/placeholder.svg"} alt={asset.name} className="h-full w-full object-cover" />
                </span>
              ) : (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-muted">
                  <FileIcon className="h-3 w-3" />
                </span>
              ),
          }))}
          value=""
          onChange={(value) => {
            if (value) {
              const asset = assets.find((a) => a.id === value)
              if (asset) {
                setSearchQuery(asset.name)
              }
            } else {
              setSearchQuery("")
            }
          }}
          searchPlaceholder="Search by name, description or tags..."
          multiSelect={false}
          className="w-full sm:w-72"
          isLoading={isLoading}
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={typeFilter} onValueChange={setTypeFilter} disabled={isLoading}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateAsset} disabled={isLoading}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center" disabled={isLoading}>
              <Grid className="mr-2 h-4 w-4" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center" disabled={isLoading}>
              <List className="mr-2 h-4 w-4" />
              List
            </TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground mt-4">
            {isLoading
              ? "Loading assets..."
              : `${filteredAssets.length} asset${filteredAssets.length !== 1 ? "s" : ""}`}
          </div>
          {viewMode === "grid" ? renderGridView() : renderListView()}
        </Tabs>
      </div>

      <AssetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAsset(null)
        }}
        onSave={handleSaveAsset}
        asset={editingAsset}
      />

      <AssetPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        assetId={previewAsset}
        onEdit={(asset) => {
          setEditingAsset(asset)
          setIsModalOpen(true)
        }}
      />
    </div>
  )
}
