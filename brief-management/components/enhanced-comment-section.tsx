"use client"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { mockUsers } from "@/lib/mock-data"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export default function EnhancedCommentSection({ comments, onAddComment }) {
  const [newComment, setNewComment] = useState("")
  const [mentionPopoverOpen, setMentionPopoverOpen] = useState(false)
  const [mentionSearch, setMentionSearch] = useState("")
  const [mentionStartIndex, setMentionStartIndex] = useState(-1)
  const [mentionedUsers, setMentionedUsers] = useState([])
  const textareaRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment(newComment, mentionedUsers)
      setNewComment("")
      setMentionedUsers([])
    }
  }

  const handleTextareaChange = (e) => {
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

  const handleMentionSelect = (user) => {
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

  // Function to render comments with mentions highlighted
  const renderCommentWithMentions = (text) => {
    // Simple regex to find @mentions
    const mentionRegex = /@(\w+)/g
    const parts = []
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
      <form onSubmit={handleSubmit} className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={mockUsers[0].avatar || "/placeholder.svg"} alt={mockUsers[0].name} />
          <AvatarFallback>{mockUsers[0].name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Popover open={mentionPopoverOpen && filteredUsers.length > 0} onOpenChange={setMentionPopoverOpen}>
            <PopoverTrigger asChild>
              <Textarea
                ref={textareaRef}
                placeholder="Add a comment... (use @ to mention someone)"
                value={newComment}
                onChange={handleTextareaChange}
                className="min-h-[80px]"
              />
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px]" align="start">
              <Command>
                <CommandInput placeholder="Search people..." />
                <CommandList>
                  <CommandEmpty>No people found</CommandEmpty>
                  <CommandGroup>
                    {filteredUsers.map((user) => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => handleMentionSelect(user)}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
                <div className="mt-1 flex flex-wrap items-center">{renderCommentWithMentions(comment.text)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
