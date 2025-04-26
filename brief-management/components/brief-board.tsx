"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileImage } from "lucide-react"
import { mockBriefs } from "@/lib/mock-data"
import { formatDate } from "@/lib/utils"
import BriefModal from "@/components/brief-modal"
import { useToast } from "@/hooks/use-toast"
import { BriefBoardSkeleton } from "@/components/loading-skeletons"

export default function BriefBoard() {
  const [briefs, setBriefs] = useState([])
  const [editingBrief, setEditingBrief] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setBriefs(mockBriefs)
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Group briefs by status
  const columns = {
    Draft: briefs.filter((brief) => brief.status === "Draft"),
    Review: briefs.filter((brief) => brief.status === "Review"),
    Approved: briefs.filter((brief) => brief.status === "Approved"),
  }

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result

    // Dropped outside the list
    if (!destination) return

    // Dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Find the brief that was dragged
    const brief = briefs.find((b) => b.id === draggableId)

    // Update the brief's status
    const updatedBrief = {
      ...brief,
      status: destination.droppableId,
    }

    // Update the briefs array
    const updatedBriefs = briefs.map((b) => (b.id === draggableId ? updatedBrief : b))

    setBriefs(updatedBriefs)

    toast({
      title: "Brief updated",
      description: `"${brief.title}" moved to ${destination.droppableId}`,
    })
  }

  const handleEditBrief = (brief) => {
    setEditingBrief(brief)
    setIsModalOpen(true)
  }

  const handleSaveBrief = (updatedBrief) => {
    setBriefs(briefs.map((brief) => (brief.id === updatedBrief.id ? updatedBrief : brief)))
    setIsModalOpen(false)
    setEditingBrief(null)
  }

  if (isLoading) {
    return <BriefBoardSkeleton />
  }

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {Object.keys(columns).map((columnId) => (
            <div key={columnId} className="flex flex-col h-full">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">{columnId}</h3>
                <Badge variant="outline">{columns[columnId].length}</Badge>
              </div>

              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-muted/50 rounded-lg p-2 flex-1 min-h-[500px] overflow-y-auto"
                  >
                    {columns[columnId].map((brief, index) => (
                      <Draggable key={brief.id} draggableId={brief.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-2 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleEditBrief(brief)}
                          >
                            <CardHeader className="p-3 pb-0">
                              <CardTitle className="text-sm font-medium">{brief.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-2">
                              <div className="text-xs text-muted-foreground mb-2 truncate">{brief.targetAudience}</div>

                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  {formatDate(brief.goLive)}
                                </div>

                                {brief.assets.length > 0 && (
                                  <div className="flex items-center">
                                    <FileImage className="mr-1 h-3 w-3" />
                                    {brief.assets.length}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-2">
                                <div className="flex -space-x-2">
                                  {brief.assignedTo.slice(0, 3).map((user, i) => (
                                    <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                      <AvatarFallback className="text-[10px]">{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {brief.assignedTo.length > 3 && (
                                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted border-2 border-background text-[10px]">
                                      +{brief.assignedTo.length - 3}
                                    </div>
                                  )}
                                </div>

                                {brief.tags.length > 0 && (
                                  <div className="flex items-center">
                                    <Badge variant="outline" className="text-[10px] h-5">
                                      {brief.tags[0]}
                                    </Badge>
                                    {brief.tags.length > 1 && (
                                      <Badge variant="outline" className="ml-1 text-[10px] h-5">
                                        +{brief.tags.length - 1}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

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
