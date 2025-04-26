"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { mockUsers } from "@/lib/mock-data"

export default function CommentSection({ comments, onAddComment }) {
  const [newComment, setNewComment] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment(newComment)
      setNewComment("")
    }
  }

  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={mockUsers[0].avatar || "/placeholder.svg"} alt={mockUsers[0].name} />
          <AvatarFallback>{mockUsers[0].name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <Button type="submit" disabled={!newComment.trim()}>
            Add Comment
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user.name}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="mt-1">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
