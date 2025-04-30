"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Loader2, MoreHorizontal, Search, Plus, AlertCircle } from "lucide-react"
import { 
  useGetUsersQuery, 
  useDeleteUserMutation
} from "@/src/graphql/generated/graphql"
import { UserModal } from "./user-modal"
import { toast } from "sonner"
import { format } from "date-fns"

// Define types for User
interface UserType {
  id: number;
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  profile_image?: string | null;
  created_at: string;
}

export default function UserList() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Get users with pagination, sorting and filtering
  const { data, loading, refetch } = useGetUsersQuery({
    variables: {
      pagination: {
        page: currentPage,
        pageSize
      },
      sort: [
        { 
          field: "CREATED_AT", 
          order: "DESC" 
        }
      ],
      filters: searchQuery ? { search: searchQuery } : undefined
    }
  })

  const [deleteUser, { loading: deleteLoading }] = useDeleteUserMutation()

  const users = data?.getUsers?.users || []
  const totalPages = data?.getUsers?.totalPages || 1
  const hasNextPage = data?.getUsers?.hasNextPage || false
  const hasPreviousPage = data?.getUsers?.hasPreviousPage || false

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page on new search
    
    // Debounced refetch
    const timeoutId = setTimeout(() => {
      refetch({
        pagination: {
          page: 1,
          pageSize
        },
        filters: e.target.value ? { search: e.target.value } : undefined
      })
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }

  const handleOpenUserModal = (user: UserType | null = null) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleCloseUserModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    
    try {
      const { data } = await deleteUser({
        variables: {
          id: userToDelete.id
        }
      })
      
      if (data?.deleteUser) {
        toast.success("User deleted successfully")
        refetch() // Refresh the list
      } else {
        toast.error("Failed to delete user")
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    }
    
    setIsDeleteAlertOpen(false)
    setUserToDelete(null)
  }

  const handleDeleteClick = (e: React.MouseEvent, user: UserType) => {
    e.stopPropagation() // Prevent row click
    setUserToDelete(user)
    setIsDeleteAlertOpen(true)
  }

  const handleRowClick = (user: UserType) => {
    router.push(`/users/${user.id}`)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    refetch({
      pagination: {
        page: newPage,
        pageSize
      },
      filters: searchQuery ? { search: searchQuery } : undefined
    })
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-4 mt-3">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <Button onClick={() => handleOpenUserModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {loading && !data ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No users found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? "Try adjusting your search term." : "Let's add some users to get started."}
          </p>
          {searchQuery && (
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: UserType) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(user)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profile_image || ""} alt={user.full_name || ""} />
                          <AvatarFallback>{user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                        </Avatar>
                        <span>{user.full_name || "Unnamed User"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email || '—'}</TableCell>
                    <TableCell>{user.phone_number || '—'}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleOpenUserModal(user)
                          }}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => handleDeleteClick(e, user)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {(totalPages > 1) && (
            <div className="flex justify-center gap-1 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPreviousPage}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center mx-2">
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNextPage}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* User Modal for Create/Edit */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseUserModal}
        user={selectedUser}
        onSuccess={() => refetch()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user {userToDelete?.full_name || "this user"} and remove all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
