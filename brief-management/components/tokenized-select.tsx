"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual'
import debounce from 'lodash/debounce'
import { Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from 'react'

interface TokenizedSelectProps {
  placeholder?: string
  emptyMessage?: string
  options: { value: string; label: string; icon?: React.ReactNode }[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  className?: string
  disabled?: boolean
  multiSelect?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => Promise<void>
  onLoadMore?: () => Promise<void>
  isLoading?: boolean
  hasMore?: boolean
  virtualized?: boolean
  loadingContent?: React.ReactNode
}

export function TokenizedSelect({
  placeholder = "Select...",
  emptyMessage = "No results found.",
  options,
  value,
  onChange,
  className,
  disabled = false,
  multiSelect = false,
  searchPlaceholder = "Search...",
  onSearch,
  onLoadMore,
  isLoading = false,
  hasMore = false,
  virtualized = false,
  loadingContent,
}: TokenizedSelectProps) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Handle mounting state
  useEffect(() => {
    setMounted(true)
  }, [])

  const selectedValues = React.useMemo(() => {
    return Array.isArray(value) ? value : value ? [value] : []
  }, [value])

  // Create virtualized list
  const rowVirtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 36, // Estimated height of each row
    overscan: 5,
  })

  // Debounced search handler
  const debouncedSearch = React.useMemo(
    () =>
      debounce(async (searchValue: string) => {
        if (onSearch) {
          setIsSearching(true)
          try {
            await onSearch(searchValue)
          } finally {
            setIsSearching(false)
          }
        }
      }, 300),
    [onSearch]
  )

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!mounted || !hasMore || !onLoadMore || !open || !loadMoreTriggerRef.current) return

    const observer = new IntersectionObserver(
      async (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true)
          try {
            await onLoadMore()
          } finally {
            setIsLoadingMore(false)
          }
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(loadMoreTriggerRef.current)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore, open, isLoadingMore, mounted])

  const handleSelect = React.useCallback(
    (selectedValue: string) => {
      if (multiSelect) {
        const newValues = selectedValues.includes(selectedValue)
          ? selectedValues.filter((v) => v !== selectedValue)
          : [...selectedValues, selectedValue]
        onChange(newValues)
      } else {
        onChange(selectedValue)
        setOpen(false)
      }
      setInputValue("")

      if (mounted) {
        requestAnimationFrame(() => {
          inputRef.current?.focus()
        })
      }
    },
    [multiSelect, onChange, selectedValues, mounted]
  )

  const handleRemove = React.useCallback(
    (valueToRemove: string, e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (multiSelect) {
        onChange(selectedValues.filter((v) => v !== valueToRemove))
      } else {
        onChange("")
      }

      if (mounted) {
        requestAnimationFrame(() => {
          inputRef.current?.focus()
        })
      }
    },
    [multiSelect, onChange, selectedValues, mounted]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !inputValue && selectedValues.length > 0) {
        handleRemove(selectedValues[selectedValues.length - 1])
      }
    },
    [handleRemove, inputValue, selectedValues]
  )

  const filteredOptions = React.useMemo(() => {
    if (onSearch) return options

    return options.filter(
      (option) =>
        !selectedValues.includes(option.value) && option.label.toLowerCase().includes(inputValue.toLowerCase()),
    )
  }, [options, selectedValues, inputValue, onSearch])

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      if (!open) setOpen(true)
      
      if (onSearch) {
        debouncedSearch(newValue)
      }
    },
    [onSearch, debouncedSearch, open]
  )

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    if (!mounted) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [mounted])

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex flex-wrap gap-1 p-2 rounded-md border border-input min-h-10 items-center cursor-text",
          open && "ring-2 ring-ring ring-offset-background",
          disabled && "cursor-not-allowed opacity-50 bg-muted",
        )}
        onClick={() => {
          if (!disabled) {
            setOpen(true)
            inputRef.current?.focus()
          }
        }}
      >
        {selectedValues.map((selectedValue) => {
          const option = options.find((o) => o.value === selectedValue)
          if (!option) return null

          if (!multiSelect) return null

          return (
            <Badge key={selectedValue} variant="secondary" className="flex items-center gap-1 px-2 py-0.5">
              {option.icon && <span className="mr-1">{option.icon}</span>}
              {option.label}
              <button
                type="button"
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
                onClick={(e) => handleRemove(selectedValue, e)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {option.label}</span>
              </button>
            </Badge>
          )
        })}

        {!multiSelect && selectedValues.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            {(() => {
              const option = options.find((o) => o.value === selectedValues[0])
              if (!option) return null
              return (
                <>
                  {option.icon && <span>{option.icon}</span>}
                  <span className="truncate">{option.label}</span>
                </>
              )
            })()}
          </div>
        )}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedValues.length > 0 ? "" : placeholder}
          className="flex-1 min-w-[80px] outline-none border-none bg-transparent text-sm placeholder:text-muted-foreground"
          disabled={disabled}
        />
        {/* {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-auto" />
        )} */}
      </div>
      {open && !disabled && (
        <div className="absolute w-full z-50 top-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
          <Command>
            <CommandList ref={listRef} className="max-h-[200px] overflow-auto">
              {filteredOptions.length === 0 && !isSearching && <CommandEmpty>{emptyMessage}</CommandEmpty>}
              {isSearching && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
              <CommandGroup>
                {virtualized ? (
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
                      const option = filteredOptions[virtualRow.index]
                      return (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleSelect(option.value)}
                          className="flex items-center gap-2 cursor-pointer absolute top-0 left-0 w-full"
                          style={{
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          {option.icon && <span>{option.icon}</span>}
                          <span>{option.label}</span>
                          {selectedValues.includes(option.value) && <Check className="h-4 w-4 ml-auto" />}
                        </CommandItem>
                      )
                    })}
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {option.icon && <span>{option.icon}</span>}
                      <span>{option.label}</span>
                      {selectedValues.includes(option.value) && <Check className="h-4 w-4 ml-auto" />}
                    </CommandItem>
                  ))
                )}
                {/* {hasMore && (
                  <div
                    ref={loadMoreTriggerRef}
                    className="flex items-center justify-center py-2"
                  >
                    {isLoadingMore ? loadingContent : null}
                  </div>
                )} */}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
