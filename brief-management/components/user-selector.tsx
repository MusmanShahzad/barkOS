"use client"

import { useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockUsers } from "@/lib/mock-data"

export default function UserSelector({ selectedUsers, onUsersChange }) {
  const [open, setOpen] = useState(false)

  const toggleUser = (user) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id)

    if (isSelected) {
      onUsersChange(selectedUsers.filter((u) => u.id !== user.id))
    } else {
      onUsersChange([...selectedUsers, user])
    }
  }

  const removeUser = (userId) => {
    onUsersChange(selectedUsers.filter((user) => user.id !== userId))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-1 bg-muted rounded-full pl-1 pr-2 py-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{user.name}</span>
            <span 
              role="button"
              tabIndex={0}
              className="inline-flex items-center justify-center h-5 w-5 rounded-full hover:bg-muted-foreground/10 cursor-pointer"
              onClick={() => removeUser(user.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  removeUser(user.id);
                }
              }}
            >
              <X className="h-3 w-3" />
            </span>
          </div>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedUsers.length > 0
              ? `${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""} selected`
              : "Select users"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {mockUsers.map((user) => (
                  <CommandItem key={user.id} onSelect={() => toggleUser(user)} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p>{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        selectedUsers.some((u) => u.id === user.id) ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
