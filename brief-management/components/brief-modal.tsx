"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, FileIcon, FileImage, MessageSquare, FileText } from "lucide-react"
import { cn, formatDate, formatFileSize } from "@/lib/utils"
import { mockProducts, mockObjectives, mockUsers, mockAssets, mockBriefs } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import EnhancedCommentSection from "@/components/enhanced-comment-section"
import AssetModal from "@/components/asset-modal"
import AssetPreviewModal from "@/components/asset-preview-modal"
import { TokenizedSelect } from "@/components/tokenized-select"
import { QuickAssetSelector } from "@/components/quick-asset-selector"
import { QuickTagSelector } from "@/components/quick-tag-selector"
import { BriefDetailSkeleton } from "@/components/loading-skeletons"

export default function BriefModal({ isOpen, onClose, onSave, brief = null }) {
  const [formData, setFormData] = useState({
    id: brief?.id || Date.now().toString(),
    title: brief?.title || "",
    product: brief?.product || "",
    objective: brief?.objective || "",
    targetAudience: brief?.targetAudience || "",
    hookAngle: brief?.hookAngle || "",
    goLive: brief?.goLive || new Date(),
    status: brief?.status || "Draft",
    assignedTo: brief?.assignedTo || [],
    assets: brief?.assets || [],
    comments: brief?.comments || [],
    tags: brief?.tags || [],
    createdAt: brief?.createdAt || new Date(),
    updatedAt: new Date(),
    relatedBriefs: brief?.relatedBriefs || [],
  })

  const [selectedAssets, setSelectedAssets] = useState([])
  const [assetModalOpen, setAssetModalOpen] = useState(false)
  const [selectedAssetForModal, setSelectedAssetForModal] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [previewAssetId, setPreviewAssetId] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // All possible tags for autocomplete
  const allPossibleTags = [
    "design",
    "marketing",
    "social",
    "website",
    "campaign",
    "product",
    "brand",
    "video",
    "photo",
    "document",
    "presentation",
    "holiday",
    "summer",
    "winter",
    "spring",
    "fall",
    "promotion",
    "sale",
    "launch",
    "event",
    "mobile",
    "desktop",
    "print",
    "digital",
    "banner",
    "logo",
    "icon",
    "illustration",
    "typography",
    "color",
    "layout",
    "wireframe",
    "mockup",
    "prototype",
    "ui",
    "ux",
    "research",
    "testing",
    "analytics",
    "data",
    "report",
  ]

  // Simulate loading data
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Autosave functionality
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      if (formData.status === "Draft" && isOpen) {
        console.log("Autosaving draft...")
        // In a real app, you would save to localStorage or backend here
      }
    }, 30000) // Autosave every 30 seconds

    return () => clearInterval(autosaveInterval)
  }, [formData, isOpen])

  // Initialize selected assets
  useEffect(() => {
    if (brief?.assets) {
      setSelectedAssets(brief.assets)
    } else {
      setSelectedAssets([])
    }
  }, [brief])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Update assets
    const updatedFormData = {
      ...formData,
      assets: selectedAssets,
    }

    onSave(updatedFormData)
  }

  const handleAddComment = (comment, mentionedUsers = []) => {
    const newComment = {
      id: Date.now().toString(),
      text: comment,
      user: mockUsers[0], // Current user
      createdAt: new Date(),
      mentions: mentionedUsers,
    }

    setFormData((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment],
    }))
  }

  const openAssetModal = (asset) => {
    setSelectedAssetForModal(asset)
    setAssetModalOpen(true)
  }

  const handleSaveAsset = (updatedAsset) => {
    // In a real app, you would update the asset in your database
    console.log("Asset updated:", updatedAsset)
    setAssetModalOpen(false)
    setSelectedAssetForModal(null)
  }

  const handlePreviewAsset = (assetId) => {
    setPreviewAssetId(assetId)
    setIsPreviewOpen(true)
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle>{brief ? "Edit Brief" : "Create New Brief"}</DialogTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusColor(formData.status)}>
                {formData.status}
              </Badge>
              <span className="text-sm text-muted-foreground">Created {formatDate(formData.createdAt)}</span>
            </div>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Set status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        {isLoading ? (
          <BriefDetailSkeleton />
        ) : (
          <div className="space-y-6 py-2">
            {/* Title Section */}
            <div className="space-y-2">
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Brief title"
                className="text-lg font-medium h-12"
              />
            </div>

            {/* Main Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="product">Product</Label>
                <TokenizedSelect
                  placeholder="Select product..."
                  options={mockProducts.map((product) => ({ value: product, label: product }))}
                  value={formData.product}
                  onChange={(value) => handleChange("product", Array.isArray(value) ? value[0] : value)}
                  searchPlaceholder="Search products..."
                  multiSelect={false}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="objective">Objective</Label>
                <TokenizedSelect
                  placeholder="Select objective..."
                  options={mockObjectives.map((objective) => ({ value: objective, label: objective }))}
                  value={formData.objective}
                  onChange={(value) => handleChange("objective", Array.isArray(value) ? value[0] : value)}
                  searchPlaceholder="Search objectives..."
                  multiSelect={false}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="goLive">Go Live Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.goLive && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.goLive ? formatDate(formData.goLive) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(formData.goLive)}
                      onSelect={(date) => handleChange("goLive", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>Assigned To</Label>
                <TokenizedSelect
                  placeholder="Assign users..."
                  options={mockUsers.map((user) => ({
                    value: user.id,
                    label: user.name,
                    icon: (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full overflow-hidden bg-muted">
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      </span>
                    ),
                  }))}
                  value={formData.assignedTo.map((user) => user.id)}
                  onChange={(value) => {
                    const selectedIds = Array.isArray(value) ? value : [value]
                    const selectedUsers = mockUsers.filter((user) => selectedIds.includes(user.id))
                    handleChange("assignedTo", selectedUsers)
                  }}
                  searchPlaceholder="Search users..."
                  multiSelect={true}
                />
              </div>
            </div>

            {/* Target Audience Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Tags:</span>
                  <QuickTagSelector
                    tags={formData.tags}
                    allTags={allPossibleTags}
                    onChange={(tags) => handleChange("tags", tags)}
                  />
                </div>
              </div>
              <Textarea
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => handleChange("targetAudience", e.target.value)}
                placeholder="Describe your target audience"
                className="min-h-[80px]"
              />
            </div>

            {/* Hook/Angle Section */}
            <div className="space-y-2">
              <Label htmlFor="hookAngle">Hook/Angle</Label>
              <Textarea
                id="hookAngle"
                value={formData.hookAngle}
                onChange={(e) => handleChange("hookAngle", e.target.value)}
                placeholder="Enter hook or angle for the brief"
                className="min-h-[100px]"
              />
            </div>

            {/* Assets Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileImage className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Assets</h3>
                </div>
              </div>

              <QuickAssetSelector
                selectedAssets={selectedAssets}
                onSelect={setSelectedAssets}
                onAddNew={() => {
                  setSelectedAssetForModal(null)
                  setAssetModalOpen(true)
                }}
              />

              {/* Selected Assets Preview */}
              {selectedAssets.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                  {selectedAssets.map((assetId) => {
                    const asset = mockAssets.find((a) => a.id === assetId)
                    if (!asset) return null

                    return (
                      <Card key={asset.id} className="overflow-hidden group relative">
                        <div
                          className="aspect-square relative bg-muted cursor-pointer"
                          onClick={() => handlePreviewAsset(asset.id)}
                        >
                          {asset.type === "image" ? (
                            <Image
                              src={asset.url || "/placeholder.svg"}
                              alt={asset.name}
                              fill
                              className="object-cover"
                            />
                          ) : asset.type === "video" ? (
                            <div className="w-full h-full relative">
                              <Image
                                src={asset.thumbnail || "/placeholder.svg?height=100&width=100&query=video thumbnail"}
                                alt={asset.name}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-8 w-8 rounded-full bg-black/60 flex items-center justify-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="white"
                                    className="w-4 h-4"
                                  >
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
                        <CardContent className="p-2">
                          <div className="truncate text-xs font-medium">{asset.name}</div>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="outline" className="text-[10px]">
                              {asset.type}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{formatFileSize(asset.size)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Related Briefs Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-medium">Related Briefs</h3>
              </div>
              <TokenizedSelect
                placeholder="Search briefs to link..."
                options={mockBriefs
                  .filter((b) => b.id !== formData.id) // Don't show the current brief
                  .map((brief) => ({
                    value: brief.id,
                    label: brief.title,
                    icon: (
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-[10px]"
                        style={{ backgroundColor: getStatusColorForBadge(brief.status) }}
                      >
                        {brief.status}
                      </span>
                    ),
                  }))}
                value={formData.relatedBriefs || []}
                onChange={(value) => handleChange("relatedBriefs", Array.isArray(value) ? value : [value])}
                searchPlaceholder="Search briefs..."
                multiSelect={true}
              />
            </div>

            {/* Comments Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-medium">Comments</h3>
              </div>
              <Separator />
              <EnhancedCommentSection comments={formData.comments} onAddComment={handleAddComment} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            Save Brief
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Asset Modal */}
      <AssetModal
        isOpen={assetModalOpen}
        onClose={() => {
          setAssetModalOpen(false)
          setSelectedAssetForModal(null)
        }}
        onSave={handleSaveAsset}
        asset={selectedAssetForModal}
      />

      {/* Asset Preview Modal */}
      <AssetPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} assetId={previewAssetId} />
    </Dialog>
  )
}

// Helper function for status color in badges
function getStatusColorForBadge(status) {
  switch (status.toLowerCase()) {
    case "draft":
      return "#FEF3C7" // Light yellow
    case "review":
      return "#DBEAFE" // Light blue
    case "approved":
      return "#D1FAE5" // Light green
    default:
      return "#F3F4F6" // Light gray
  }
}
