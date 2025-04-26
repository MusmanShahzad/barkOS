"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Loader2, Tag, X } from "lucide-react"
import { VirtualList } from "@/components/virtual-list"

export function QuickTagSelector({ tags = [], allTags = [], onChange, isLoading = false }) {
  const [open, setOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState(tags)
  const [inputValue, setInputValue] = useState("")
  const [filteredTags, setFilteredTags] = useState([])
  const [loadingTags, setLoadingTags] = useState(false)

  // Update local state when props change
  useEffect(() => {
    setSelectedTags(tags)
  }, [tags])

  // Filter tags based on input
  useEffect(() => {
    if (open) {
      setLoadingTags(true)

      // Simulate API call with delay
      const timer = setTimeout(() => {
        const filtered = allTags.filter(
          (tag) => !selectedTags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase()),
        )
        setFilteredTags(filtered)
        setLoadingTags(false)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [open, inputValue, allTags, selectedTags])

  const handleSelect = (tag) => {
    const newTags = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]

    setSelectedTags(newTags)
    onChange(newTags)
    setInputValue("")
  }

  const handleRemove = (tag) => {
    const newTags = selectedTags.filter((t) => t !== tag)
    setSelectedTags(newTags)
    onChange(newTags)
  }

  const renderTagItem = (tag) => (
    <CommandItem key={tag} value={tag} onSelect={() => handleSelect(tag)}>
      <div className="flex items-center gap-2">
        <Check className={`h-4 w-4 ${selectedTags.includes(tag) ? "opacity-100" : "opacity-0"}`} />
        <span>{tag}</span>
      </div>
    </CommandItem>
  )

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>
                {selectedTags.length === 0
                  ? "Select Tags"
                  : `${selectedTags.length} Tag${selectedTags.length !== 1 ? "s" : ""} Selected`}
              </span>
            </div>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." value={inputValue} onValueChange={setInputValue} />
            <CommandList>
              <CommandEmpty>
                {loadingTags ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Loading tags...</span>
                  </div>
                ) : (
                  "No tags found."
                )}
              </CommandEmpty>
              <CommandGroup>
                {loadingTags ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Loading tags...</span>
                  </div>
                ) : (
                  <VirtualList
                    items={filteredTags}
                    renderItem={renderTagItem}
                    itemHeight={36}
                    height={200}
                    emptyMessage="No matching tags found"
                  />
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 rounded-full"
                onClick={() => handleRemove(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
