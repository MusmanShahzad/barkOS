"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, Trash2, Loader2, BookOpen } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useGetUserQuery, useGetUserBriefsQuery, useDeleteUserMutation, BriefStatus, User } from "@/src/graphql/generated/graphql"
import { toast } from "sonner"
import { UserModal } from "./user-modal"

interface BriefSummary {
  id: number
  title?: string | null
  description?: string | null
  status?: BriefStatus | null
  created_at: string
}

export default function UserDetailView({ userId }: { userId: number }) {
  const router = useRouter()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { data, loading, error, refetch } = useGetUserQuery({
    variables: { id: userId },
    fetchPolicy: "network-only"
  })

  const { data: briefsData } = useGetUserBriefsQuery({
    variables: { userId },
    skip: !userId
  })

  const [deleteUser, { loading: deleteLoading }] = useDeleteUserMutation()

  const user = data?.getUser
  // Safe conversion with type checking
  const briefs: BriefSummary[] = (briefsData?.getUserBriefs || [])
    .filter(Boolean)
    .map(brief => ({
      id: brief!.id,
      title: brief!.title,
      description: brief!.description,
      status: brief!.status,
      created_at: brief!.created_at
    }))

  const handleDeleteUser = async () => {
    try {
      const { data } = await deleteUser({
        variables: { id: userId }
      })

      if (data?.deleteUser) {
        toast.success("User deleted successfully")
        router.push("/users")
      } else {
        toast.error("Failed to delete user")
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <h2 className="text-2xl font-bold mb-2">Error Loading User</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => router.push("/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
        <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => router.push("/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    )
  }

  // Create a proper user object that matches the User type to avoid type errors
  const userForModal: User = {
    id: user.id,
    full_name: user.full_name || null,
    email: user.email || null,
    bio: user.bio || null,
    phone_number: user.phone_number || null,
    profile_image: user.profile_image || null,
    created_at: user.created_at,
    briefs: [],
    __typename: "User"
  }

  return (
    <div className="space-y-6 mt-3">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(true)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </Button>
          <Button onClick={() => setIsEditModalOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>User information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.profile_image || ""} alt={user.full_name || ""} />
              <AvatarFallback>
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-medium mb-1">{user.full_name || "Unnamed User"}</h3>
            <p className="text-sm text-muted-foreground">{user.email || "No email"}</p>
            
            <Separator className="my-4" />
            
            <div className="w-full">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="text-muted-foreground">Joined</div>
                <div className="text-right">{formatDate(user.created_at)}</div>
                
                <div className="text-muted-foreground">Phone</div>
                <div className="text-right">{user.phone_number || "—"}</div>
                
                <div className="text-muted-foreground">Active Briefs</div>
                <div className="text-right">{briefs.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Complete information about the user</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="briefs">Briefs ({briefs.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Bio</h3>
                  <p className="text-muted-foreground">
                    {user.bio || "No bio provided."}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span>{user.email || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span>{user.phone_number || "—"}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="briefs" className="space-y-4">
                {briefs.length === 0 ? (
                  <div className="text-center p-4 border rounded-md">
                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <h3 className="font-medium">No briefs found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      This user is not associated with any briefs yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {briefs.map((brief) => (
                      <div 
                        key={brief.id} 
                        className="p-3 border rounded-md hover:bg-muted/50 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-medium">{brief.title || "Untitled Brief"}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {brief.description || "No description"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(brief.created_at)}
                          </span>
                          {brief.status && (
                            <Badge variant={brief.status === "Live" ? "default" : "secondary"}>
                              {brief.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user {user.full_name || ""} and remove all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteUser}
              disabled={deleteLoading}
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Modal */}
      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userForModal}
        onSuccess={() => refetch()}
      />
    </div>
  )
} 