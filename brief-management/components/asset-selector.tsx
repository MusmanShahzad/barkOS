"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileIcon, Grid, List, Plus, Search, X } from "lucide-react"
import { mockAssets } from "@/lib/mock-data"
import { formatFileSize } from "@/lib/utils"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"

export function AssetSelector({ isOpen, onClose, selectedAssets = [], onSelect }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [localSelectedAssets, setLocalSelectedAssets] = useState(selectedAssets)

  // Filter assets based on search query
  const filteredAssets = mockAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const toggleAssetSelection = (assetId) => {
    setLocalSelectedAssets((prev) => {
      if (prev.includes(assetId)) {
        return prev.filter((id) => id !== assetId)
      } else {
        return [...prev, assetId]
      }
    })
  }

  const handleSave = () => {
    onSelect(localSelectedAssets)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Assets</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
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
            <Button variant="outline" onClick={() => onClose()}>
              <Plus className="mr-2 h-4 w-4" />
              Upload New
            </Button>
          </div>

          <Tabs defaultValue={viewMode} onValueChange={setViewMode} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="grid" className="flex items-center">
                  <Grid className="mr-2 h-4 w-4" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center">
                  <List className="mr-2 h-4 w-4" />
                  List
                </TabsTrigger>
              </TabsList>
              <div className="text-sm text-muted-foreground">
                {filteredAssets.length} asset{filteredAssets.length !== 1 ? "s" : ""}
              </div>
            </div>

            <TabsContent value="grid" className="mt-0">
              {filteredAssets.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                  <FileIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No assets found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredAssets.map((asset) => (
                    <Card
                      key={asset.id}
                      className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
                        localSelectedAssets.includes(asset.id) ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => toggleAssetSelection(asset.id)}
                    >
                      <div className="aspect-square relative bg-muted">
                        {asset.type === "image" ? (
                          <Image src={asset.url || "/placeholder.svg"} alt={asset.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileIcon className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <Checkbox
                            checked={localSelectedAssets.includes(asset.id)}
                            className="h-5 w-5 bg-background/80"
                            onCheckedChange={() => toggleAssetSelection(asset.id)}
                          />
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="truncate font-medium text-sm">{asset.name}</div>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <div>{formatFileSize(asset.size)}</div>
                          <Badge variant="outline" className="text-xs">
                            {asset.type}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <div className="border rounded-md divide-y">
                {filteredAssets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No assets found. Try adjusting your search.
                  </div>
                ) : (
                  filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`flex items-center p-3 hover:bg-muted/50 cursor-pointer ${
                        localSelectedAssets.includes(asset.id) ? "bg-muted/70" : ""
                      }`}
                      onClick={() => toggleAssetSelection(asset.id)}
                    >
                      <Checkbox
                        checked={localSelectedAssets.includes(asset.id)}
                        className="mr-3"
                        onCheckedChange={() => toggleAssetSelection(asset.id)}
                      />
                      <div className="h-10 w-10 mr-3 rounded overflow-hidden bg-muted flex-shrink-0">
                        {asset.type === "image" ? (
                          <Image
                            src={asset.url || "/placeholder.svg"}
                            alt={asset.name}
                            width={40}
                            height={40}
                            className="object-cover h-full w-full"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{asset.name}</div>
                        <div className="text-xs text-muted-foreground">{formatFileSize(asset.size)}</div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {asset.type}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm">
              {localSelectedAssets.length} asset{localSelectedAssets.length !== 1 ? "s" : ""} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Add Selected</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
