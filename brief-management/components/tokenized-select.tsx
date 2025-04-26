"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
}: TokenizedSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedValues = React.useMemo(() => {
    return Array.isArray(value) ? value : value ? [value] : []
  }, [value])

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

      // Focus the input after selection
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 0)
    },
    [multiSelect, onChange, selectedValues],
  )

  const handleRemove = React.useCallback(
    (valueToRemove: string, e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (multiSelect) {
        onChange(selectedValues.filter((v) => v !== valueToRemove))
      } else {
        onChange("")
      }

      // Focus the input after removal
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 0)
    },
    [multiSelect, onChange, selectedValues],
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !inputValue && selectedValues.length > 0) {
        handleRemove(selectedValues[selectedValues.length - 1])
      }
    },
    [handleRemove, inputValue, selectedValues],
  )

  const filteredOptions = React.useMemo(() => {
    return options.filter(
      (option) =>
        !selectedValues.includes(option.value) && option.label.toLowerCase().includes(inputValue.toLowerCase()),
    )
  }, [options, selectedValues, inputValue])

  // Handle clicking outside to close the dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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

          // For single selection, don't show as badge
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

        {/* For single selection, show the selected value as text */}
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
          onChange={(e) => {
            setInputValue(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedValues.length > 0 ? "" : placeholder}
          className="flex-1 min-w-[80px] outline-none border-none bg-transparent text-sm placeholder:text-muted-foreground"
          disabled={disabled}
        />
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-auto" />
      </div>
      {open && !disabled && (
        <div className="absolute w-full z-50 top-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
          <Command>
            {/* Remove the CommandInput since we already have search in the main field */}
            <CommandList>
              {filteredOptions.length === 0 && <CommandEmpty>{emptyMessage}</CommandEmpty>}
              <CommandGroup>
                {filteredOptions.map((option) => (
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
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
