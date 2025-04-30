"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { MediaUpload } from "./media-upload"
import { 
  useCreateUserMutation,
  useUpdateUserMutation,
  UserInput,
  User
} from "@/src/graphql/generated/graphql"

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  onSuccess?: () => void
}

export function UserModal({ isOpen, onClose, user, onSuccess }: UserModalProps) {
  const [createUser, { loading: createLoading }] = useCreateUserMutation()
  const [updateUser, { loading: updateLoading }] = useUpdateUserMutation()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  
  const [formData, setFormData] = useState<UserInput>({
    full_name: "",
    email: "",
    bio: "",
    phone_number: "",
    profile_image: ""
  })

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        bio: user.bio || "",
        phone_number: user.phone_number || "",
        profile_image: user.profile_image || ""
      })
    } else {
      setFormData({
        full_name: "",
        email: "",
        bio: "",
        phone_number: "",
        profile_image: ""
      })
    }
  }, [user, isOpen])

  const handleChange = (field: keyof UserInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    try {
      if (!formData.full_name || !formData.email) {
        toast.error("Name and email are required")
        return
      }

      if (user?.id) {
        // Update existing user
        const { data } = await updateUser({
          variables: {
            id: user.id,
            input: formData
          }
        })

        if (data?.updateUser) {
          toast.success("User updated successfully")
          onSuccess?.()
          onClose()
        }
      } else {
        // Create new user
        const { data } = await createUser({
          variables: {
            input: formData
          }
        })

        if (data?.createUser) {
          toast.success("User created successfully")
          onSuccess?.()
          onClose()
        }
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    }
  }

  const handleUploadComplete = (media: { id: number; url: string }) => {
    setFormData((prev) => ({
      ...prev,
      profile_image: media.url
    }))
    setIsUploading(false)
    toast.success("Profile image uploaded successfully")
  }

  const handleUploadError = (error: Error) => {
    setIsUploading(false)
    toast.error(`Upload failed: ${error.message}`)
  }

  const handleUploadStart = () => {
    setIsUploading(true)
    setUploadProgress(0)
  }

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress)
  }

  const isLoading = createLoading || updateLoading

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Create New User"}</DialogTitle>
          <DialogDescription>
            {user 
              ? "Update user information in the system." 
              : "Add a new user to the system."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center mb-4">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={formData.profile_image || ""} />
              <AvatarFallback>
                {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="h-2 w-40 bg-secondary rounded-full mb-2">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">Uploading... {Math.round(uploadProgress)}%</span>
              </div>
            ) : (
              <MediaUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                onUploadStart={handleUploadStart}
                onUploadProgress={handleUploadProgress}
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input 
              id="full_name" 
              value={formData.full_name || ''} 
              onChange={(e) => handleChange("full_name", e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={formData.email || ''} 
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input 
              id="phone_number" 
              value={formData.phone_number || ''} 
              onChange={(e) => handleChange("phone_number", e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              value={formData.bio || ''} 
              onChange={(e) => handleChange("bio", e.target.value)}
              disabled={isLoading}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || isUploading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user ? "Update User" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 