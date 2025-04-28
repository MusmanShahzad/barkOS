"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { TokenizedSelect } from "@/components/tokenized-select"
import { Asset, useUpdateAssetMutation, useGetAssetQuery } from "@/src/graphql/generated/graphql"

interface AssetUpdateModalProps {
  assetId: number | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function AssetUpdateModal({ assetId, isOpen, onClose, onUpdate }: AssetUpdateModalProps) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedTags, setSelectedTags] = useState<{ id: number; name: string }[]>([])
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  const { data: assetData, loading: isLoading } = useGetAssetQuery({
    variables: { id: assetId! },
    skip: !assetId,
  })

  const [updateAsset, { loading: isUpdating }] = useUpdateAssetMutation({
    onCompleted: () => {
      toast({
        title: "Success",
        description: "Asset updated successfully",
      })
      onUpdate()
      onClose()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (assetData?.asset) {
      setName(assetData.asset.name || "")
      setDescription(assetData.asset.description || "")
      setSelectedTags(assetData.asset.tags?.map(tag => ({ id: tag.id, name: tag.name })) || [])
    }
  }, [assetData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assetId) return

    try {
      await updateAsset({
        variables: {
          id: assetId,
          input: {
            name,
            description,
            tagIds: selectedTags.map(tag => tag.id),
            ...(thumbnailFile && { thumbnail: thumbnailFile }),
          },
        },
      })
    } catch (error) {
      console.error("Error updating asset:", error)
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Asset name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Asset description"
            />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <TokenizedSelect
              value={selectedTags}
              onChange={setSelectedTags}
              placeholder="Select tags"
            />
          </div>
          {/* <div className="space-y-2">
            <Label>Thumbnail</Label>
            <FileUpload
              onFileSelect={setThumbnailFile}
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
            />
          </div> */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 