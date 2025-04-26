"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Loader2 } from "lucide-react"

export function VirtualList({
  items = [],
  renderItem,
  itemHeight = 40,
  height = 300,
  width = "100%",
  hasMore = false,
  loadMore = () => {},
  isLoading = false,
  emptyMessage = "No items found",
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef(null)
  const [visibleItems, setVisibleItems] = useState([])

  // Calculate which items should be visible
  const calculateVisibleItems = useCallback(() => {
    if (!containerRef.current) return

    const scrollTop = containerRef.current.scrollTop
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(startIndex + Math.ceil(height / itemHeight) + 1, items.length)

    // Add buffer items before and after for smoother scrolling
    const bufferSize = 5
    const bufferedStartIndex = Math.max(0, startIndex - bufferSize)
    const bufferedEndIndex = Math.min(items.length, endIndex + bufferSize)

    setVisibleItems(
      items.slice(bufferedStartIndex, bufferedEndIndex).map((item, index) => ({
        item,
        index: bufferedStartIndex + index,
      })),
    )
  }, [items, height, itemHeight])

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    setScrollTop(containerRef.current.scrollTop)
    calculateVisibleItems()

    // Check if we need to load more items
    if (hasMore && !isLoading) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMore()
      }
    }
  }, [calculateVisibleItems, hasMore, isLoading, loadMore])

  // Initialize visible items
  useEffect(() => {
    calculateVisibleItems()
  }, [items, calculateVisibleItems])

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div style={{ height, width }} className="flex items-center justify-center text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{ height, width, overflow: "auto" }}
      onScroll={handleScroll}
      className="virtual-list-container"
    >
      <div
        style={{
          height: `${items.length * itemHeight}px`,
          position: "relative",
        }}
      >
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: `${index * itemHeight}px`,
              height: `${itemHeight}px`,
              width: "100%",
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-center p-2 absolute bottom-0 left-0 right-0">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-xs">Loading more...</span>
          </div>
        )}
      </div>
    </div>
  )
}
