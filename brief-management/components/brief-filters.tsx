import React, { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"
import { 
  useGetBriefDropDownsQuery,
  BriefStatus
} from "@/src/graphql/generated/graphql"

interface BriefFiltersProps {
  searchQuery: string
  statusFilters: Record<string, boolean>
  productFilters: Record<number, boolean>
  tagFilters: Record<number, boolean>
  objectiveFilters: Record<number, boolean>
  totalCount: number
  onSearchChange: (value: string) => void
  onStatusFilterChange: (status: string, checked: boolean) => void
  onProductFilterChange: (id: number, checked: boolean) => void
  onTagFilterChange: (id: number, checked: boolean) => void
  onObjectiveFilterChange: (id: number, checked: boolean) => void
  onClearFilters: () => void
  onClose: () => void
}

const BriefFilters: React.FC<BriefFiltersProps> = ({
  searchQuery,
  statusFilters,
  productFilters,
  tagFilters,
  objectiveFilters,
  totalCount,
  onSearchChange,
  onStatusFilterChange,
  onProductFilterChange,
  onTagFilterChange,
  onObjectiveFilterChange,
  onClearFilters,
  onClose
}) => {
  // Fetch dropdown data for filters
  const { data: dropdownData, loading } = useGetBriefDropDownsQuery()

  // Initialize filter data when available
  useEffect(() => {
    if (dropdownData) {
      // Initialize product filters if they're empty
      if (dropdownData.getProducts && Object.keys(productFilters).length === 0) {
        const products: Record<number, boolean> = {}
        dropdownData.getProducts.forEach(product => {
          if (product) {
            products[product.id] = true
          }
        })
        if (Object.keys(products).length > 0) {
          onProductFilterChange(Object.keys(products)[0] as unknown as number, true)
        }
      }

      // Initialize objective filters if they're empty
      if (dropdownData.getObjectives && Object.keys(objectiveFilters).length === 0) {
        const objectives: Record<number, boolean> = {}
        dropdownData.getObjectives.forEach(objective => {
          if (objective) {
            objectives[objective.id] = true
          }
        })
        if (Object.keys(objectives).length > 0) {
          onObjectiveFilterChange(Object.keys(objectives)[0] as unknown as number, true)
        }
      }

      // Initialize tag filters if they're empty
      if (dropdownData.getTags && Object.keys(tagFilters).length === 0) {
        const tags: Record<number, boolean> = {}
        dropdownData.getTags.forEach(tag => {
          if (tag) {
            tags[tag.id] = true
          }
        })
        if (Object.keys(tags).length > 0) {
          onTagFilterChange(Object.keys(tags)[0] as unknown as number, true)
        }
      }
    }
  }, [dropdownData, productFilters, objectiveFilters, tagFilters, onProductFilterChange, onObjectiveFilterChange, onTagFilterChange])

  // Helper function to get status color
  const getStatusColor = (status: BriefStatus): string => {
    switch (status) {
      case "Draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "Review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "Approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "Live":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  // Calculate if any filters are active
  const areFiltersActive = (): boolean => {
    const allStatusSelected = Object.values(statusFilters).every((value) => value)
    const allProductsSelected = Object.values(productFilters).every((value) => value)
    const allObjectivesSelected = Object.values(objectiveFilters).every((value) => value)
    const allTagsSelected = Object.values(tagFilters).every((value) => value)

    return searchQuery.trim() !== "" || 
           !allStatusSelected || 
           !allProductsSelected || 
           !allObjectivesSelected || 
           !allTagsSelected
  }

  // Count active filters
  const getActiveFilterCount = (): number => {
    let count = 0

    if (searchQuery.trim() !== "") count++

    // Count how many filter groups have at least one deselected item
    if (Object.values(statusFilters).some(value => !value)) count++
    if (Object.values(productFilters).some(value => !value)) count++
    if (Object.values(objectiveFilters).some(value => !value)) count++
    if (Object.values(tagFilters).some(value => !value)) count++

    return count
  }

  // Skeleton loading component for filter items
  const FilterSkeleton = ({ count = 3 }: { count?: number }) => (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-2 animate-pulse">
          <div className="h-4 w-4 rounded-sm bg-muted" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="mb-4 p-4 border rounded-lg bg-background shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Filter Briefs</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8 text-xs">
            Clear All
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-xs">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search briefs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1.5 h-6 w-6"
                onClick={() => onSearchChange("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-xs">Status</Label>
          <div className="flex flex-col space-y-2">
            {Object.keys(statusFilters).map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={statusFilters[status]}
                  onCheckedChange={(checked) => {
                    onStatusFilterChange(status, !!checked)
                  }}
                />
                <Label htmlFor={`status-${status}`} className="text-sm cursor-pointer">
                  <Badge variant="outline" className={`${getStatusColor(status as BriefStatus)} mr-2`}>
                    {status}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Products Filter */}
        <div className="space-y-2">
          <Label className="text-xs">Products</Label>
          <div className="flex flex-col space-y-2 max-h-36 overflow-y-auto pr-2">
            {loading ? (
              <FilterSkeleton count={4} />
            ) : (
              dropdownData?.getProducts?.map(product => product && (
                <div key={product.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`product-${product.id}`}
                    checked={productFilters[product.id] || false}
                    onCheckedChange={(checked) => {
                      onProductFilterChange(product.id, !!checked)
                    }}
                  />
                  <Label htmlFor={`product-${product.id}`} className="text-sm cursor-pointer">
                    {product.name}
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Objectives Filter */}
        <div className="space-y-2">
          <Label className="text-xs">Objectives</Label>
          <div className="flex flex-col space-y-2 max-h-36 overflow-y-auto pr-2">
            {loading ? (
              <FilterSkeleton count={4} />
            ) : (
              dropdownData?.getObjectives?.map(objective => objective && (
                <div key={objective.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`objective-${objective.id}`}
                    checked={objectiveFilters[objective.id] || false}
                    onCheckedChange={(checked) => {
                      onObjectiveFilterChange(objective.id, !!checked)
                    }}
                  />
                  <Label htmlFor={`objective-${objective.id}`} className="text-sm cursor-pointer">
                    {objective.name}
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tags section (additional row) */}
      <div className="mt-4">
        <Label className="text-xs">Tags</Label>
        <div className="mt-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border rounded-md">
          {loading ? (
            <div className="flex flex-wrap gap-2 w-full">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex items-center animate-pulse">
                  <div className="h-4 w-4 rounded-sm bg-muted mr-1.5" />
                  <div className="h-4 w-16 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            dropdownData?.getTags?.map(tag => tag && (
              <div key={tag.id} className="flex items-center">
                <Checkbox
                  id={`tag-${tag.id}`}
                  className="mr-1.5"
                  checked={tagFilters[tag.id] || false}
                  onCheckedChange={(checked) => {
                    onTagFilterChange(tag.id, !!checked)
                  }}
                />
                <Label htmlFor={`tag-${tag.id}`} className="text-xs cursor-pointer">
                  {tag.name}
                </Label>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Filter Results Summary */}
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {totalCount || 0} briefs
        {areFiltersActive() && (
          <span>
            {" "}
            with {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  )
}

export default BriefFilters 