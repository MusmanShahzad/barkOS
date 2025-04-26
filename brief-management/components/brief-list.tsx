"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MoreHorizontal, Search } from "lucide-react"
import BriefModal from "@/components/brief-modal"
import { mockBriefs } from "@/lib/mock-data"
import { formatDate } from "@/lib/utils"
import { BriefListSkeleton } from "@/components/loading-skeletons"

export default function BriefList() {
  const [briefs, setBriefs] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingBrief, setEditingBrief] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setBriefs(mockBriefs)
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const filteredBriefs = briefs.filter((brief) => {
    const matchesSearch =
      brief.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brief.targetAudience.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || brief.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const handleEditBrief = (brief) => {
    setEditingBrief(brief)
    setIsModalOpen(true)
  }

  const handleSaveBrief = (updatedBrief) => {
    setBriefs(briefs.map((brief) => (brief.id === updatedBrief.id ? updatedBrief : brief)))
    setIsModalOpen(false)
    setEditingBrief(null)
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "review":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search briefs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <BriefListSkeleton />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brief Title</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Go Live</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBriefs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No briefs found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBriefs.map((brief) => (
                  <TableRow
                    key={brief.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEditBrief(brief)}
                  >
                    <TableCell className="font-medium">{brief.title}</TableCell>
                    <TableCell>{brief.product}</TableCell>
                    <TableCell>{brief.targetAudience}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatDate(brief.goLive)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(brief.status)}>
                        {brief.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {brief.assignedTo.map((user, i) => (
                          <Avatar key={i} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
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
                              handleEditBrief(brief)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setBriefs(briefs.filter((b) => b.id !== brief.id))
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {editingBrief && (
        <BriefModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingBrief(null)
          }}
          onSave={handleSaveBrief}
          brief={editingBrief}
        />
      )}
    </div>
  )
}
