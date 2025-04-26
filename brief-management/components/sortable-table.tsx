"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function SortableTable({ data, columns, onRowClick, isLoading = false }) {
  const [sorting, setSorting] = useState({
    column: null,
    direction: "asc",
  })

  const handleSort = (column) => {
    if (!column.sortable) return

    setSorting((prev) => {
      if (prev.column === column.id) {
        return {
          column: column.id,
          direction: prev.direction === "asc" ? "desc" : "asc",
        }
      }
      return {
        column: column.id,
        direction: "asc",
      }
    })
  }

  const sortedData = [...(data || [])]
  if (sorting.column) {
    const column = columns.find((col) => col.id === sorting.column)
    if (column && column.sortable && column.sortingFn) {
      sortedData.sort((a, b) => {
        const result = column.sortingFn(a, b)
        return sorting.direction === "asc" ? result : -result
      })
    }
  }

  const getSortIcon = (column) => {
    if (!column.sortable) return null
    if (sorting.column !== column.id) return <ArrowUpDown className="ml-2 h-4 w-4" />
    return sorting.direction === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.sortable ? "cursor-pointer" : ""}>
                <div
                  className="flex items-center"
                  onClick={() => handleSort(column)}
                  role={column.sortable ? "button" : undefined}
                  tabIndex={column.sortable ? 0 : undefined}
                >
                  {column.header}
                  {getSortIcon(column)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeleton rows
            Array(5)
              .fill(0)
              .map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={`skeleton-${rowIndex}-${colIndex}`}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
          ) : sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                No data found.
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <TableCell key={`${rowIndex}-${column.id}`}>{column.cell(row)}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
