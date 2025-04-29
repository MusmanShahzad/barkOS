"use client"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { mockUsers } from "@/lib/mock-data"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string
  name: string
  avatar?: string
}

interface Comment {
  id: string
  text: string
  user: User
  createdAt: string
}

interface EnhancedCommentSectionProps {
  comments: Comment[]
  onAddComment: (text: string, mentionedUsers: User[]) => void
  isLoading?: boolean
  placeholder?: string
}

export default function EnhancedCommentSection({ 
  comments, 
  onAddComment, 
  isLoading = false,
  placeholder = "Add a comment... (use @ to mention someone)"
}: EnhancedCommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [mentionPopoverOpen, setMentionPopoverOpen] = useState(false)
  const [mentionSearch, setMentionSearch] = useState("")
  const [mentionStartIndex, setMentionStartIndex] = useState(-1)
  const [mentionedUsers, setMentionedUsers] = useState<User[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment, mentionedUsers)
      setNewComment("")
      setMentionedUsers([])
    }
  }

  // Keep this for handling Enter key in the future if needed
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setNewComment(value)

    // Check for @ symbol to trigger mention
    const lastAtSymbolIndex = value.lastIndexOf("@")
    if (lastAtSymbolIndex !== -1 && (lastAtSymbolIndex === 0 || value[lastAtSymbolIndex - 1] === " ")) {
      const mentionText = value.substring(lastAtSymbolIndex + 1).split(" ")[0]
      setMentionSearch(mentionText)
      setMentionStartIndex(lastAtSymbolIndex)
      setMentionPopoverOpen(true)
    } else {
      setMentionPopoverOpen(false)
    }
  }

  const handleMentionSelect = (user: User) => {
    // Replace the @mention text with the selected user
    const beforeMention = newComment.substring(0, mentionStartIndex)
    const afterMention = newComment.substring(mentionStartIndex + 1 + mentionSearch.length)

    // Add the mention with a non-breaking space after it
    const updatedComment = `${beforeMention}@${user.name} ${afterMention}`

    setNewComment(updatedComment)
    setMentionPopoverOpen(false)

    // Add to mentioned users if not already included
    if (!mentionedUsers.some((u) => u.id === user.id)) {
      setMentionedUsers([...mentionedUsers, user])
    }

    // Focus back on textarea
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const filteredUsers = mockUsers.filter((user) => user.name.toLowerCase().includes(mentionSearch.toLowerCase()))

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  // Function to render comments with mentions highlighted
  const renderCommentWithMentions = (text: string) => {
    // Simple regex to find @mentions
    const mentionRegex = /@(\w+)/g
    const parts: (string | JSX.Element)[] = []
    let lastIndex = 0
    let match

    // Find all mentions and build parts array
    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }

      // Add the mention as a badge
      const mentionName = match[1]
      parts.push(
        <Badge key={`mention-${match.index}`} variant="secondary" className="font-medium mr-1">
          @{mentionName}
        </Badge>,
      )

      lastIndex = match.index + match[0].length
    }

    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={mockUsers[0].avatar || "/placeholder.svg"} alt={mockUsers[0].name} />
          <AvatarFallback>{mockUsers[0].name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
        <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={newComment}
                onChange={handleTextareaChange}
                className="min-h-[80px]"
              />
          <Button 
            type="button" 
            onClick={handleAddComment}
            disabled={!newComment.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Posting...
              </>
            ) : (
              'Add Comment'
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {comments?.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</div>
        ) : (
          comments?.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                <AvatarFallback>{comment.user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user.name}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center">{renderCommentWithMentions(comment.text)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
