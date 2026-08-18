"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps {
  pageSize: number
  setPageSize: (size: number) => void
  handlePreviousPage: () => void
  handleNextPage: () => void
  isLoading: boolean
  hasPreviousPage: boolean
  hasNextPage: boolean
  pageSizeOptions?: number[]
}

export function DataTablePagination({
  pageSize,
  setPageSize,
  handlePreviousPage,
  handleNextPage,
  isLoading,
  hasPreviousPage,
  hasNextPage,
  pageSizeOptions = [10, 20, 50],
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-border p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Rows per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => setPageSize(Number(value))}
        >
          <SelectTrigger className="h-8 w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={isLoading || !hasPreviousPage}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={isLoading || !hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
