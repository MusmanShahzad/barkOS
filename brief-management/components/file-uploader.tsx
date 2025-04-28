"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileIcon, MoreHorizontal, Pencil, Trash2, Upload, X } from "lucide-react"
import Image from "next/image"
import { useUploadMediaMutation, useDeleteMediaMutation } from "@/src/graphql/generated/graphql"
import { toast } from "sonner"

interface Asset {
  id: string | number
  name: string
  type: string
  size: number
  url: string
  file?: File
}

interface FileUploaderProps {
  assets: Asset[]
  onAddAsset: (asset: Asset) => void
  onRemoveAsset: (id: string | number) => void
}

export default function FileUploader({ assets, onAddAsset, onRemoveAsset }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [renamingAsset, setRenamingAsset] = useState<Asset | null>(null)
  const [newName, setNewName] = useState("")
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const [uploadMedia] = useUploadMediaMutation()
  const [deleteMedia] = useDeleteMediaMutation()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("handleDrop")
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    
    if (e.target.files && e.target.files[0]) {
      await handleFiles(e.target.files)
    }
  }

  const handleFiles = async (files: FileList) => {
    const filesArray = Array.from(files)

    for (const file of filesArray) {
      try {
        // Upload to server
        const { data } = await uploadMedia({
          variables: { file }
        })

        if (data?.uploadMedia) {
          const newAsset: Asset = {
            id: data.uploadMedia.id,
            name: file.name,
            type: file.type.split("/")[0],
            size: file.size,
            url: data.uploadMedia.url,
          }

          onAddAsset(newAsset)
          toast.success("File uploaded successfully")
        }
      } catch (error) {
        console.error("Upload error:", error)
        toast.error("Failed to upload file")
      }
    }
  }

  const handleRenameClick = (asset: Asset) => {
    setRenamingAsset(asset)
    setNewName(asset.name)
    setIsRenameDialogOpen(true)
  }

  const handleRename = () => {
    if (newName.trim() && renamingAsset) {
      const updatedAsset = {
        ...renamingAsset,
        name: newName.trim(),
      }

      onRemoveAsset(renamingAsset.id)
      onAddAsset(updatedAsset)

      setIsRenameDialogOpen(false)
      setRenamingAsset(null)
      setNewName("")
    }
  }

  const handlePreview = (asset: Asset) => {
    setPreviewAsset(asset)
    setIsPreviewOpen(true)
  }

  const handleDelete = async (id: string | number) => {
    try {
      await deleteMedia({
        variables: { id: Number(id) }
      })
      onRemoveAsset(id)
      toast.success("File deleted successfully")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete file")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="font-medium text-lg">Drag & drop files here</h3>
          <p className="text-sm text-muted-foreground mb-4">or click to browse files from your computer</p>
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            Choose Files here
          </Button>
          <input ref={inputRef} type="file" multiple className="hidden" onChange={handleChange} />
        </div>
      </div>

      {assets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden">
              <CardContent className="p-0 relative group">
                <div className="aspect-square relative cursor-pointer" onClick={() => handlePreview(asset)}>
                  {asset.type === "image" ? (
                    <Image src={asset.url || "/placeholder.svg"} alt={asset.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <FileIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePreview(asset)
                    }}
                  >
                    Preview
                  </Button>
                </div>

                <div className="p-2 flex items-center justify-between">
                  <div className="truncate text-sm" title={asset.name}>
                    {asset.name}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRenameClick(asset)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(asset.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Asset</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{previewAsset?.name}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {previewAsset?.type === "image" ? (
              <div className="relative w-full max-h-[500px] flex items-center justify-center">
                <Image
                  src={previewAsset.url || "/placeholder.svg"}
                  alt={previewAsset.name}
                  width={800}
                  height={500}
                  className="object-contain max-h-[500px]"
                />
              </div>
            ) : (
              <div className="w-full h-64 flex flex-col items-center justify-center bg-muted rounded-lg">
                <FileIcon className="h-16 w-16 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">{previewAsset?.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(previewAsset?.size || 0)}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
