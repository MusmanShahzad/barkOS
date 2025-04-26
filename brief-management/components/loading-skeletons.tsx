import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function AssetGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square relative bg-muted">
              <Skeleton className="h-full w-full" />
            </div>
            <CardContent className="p-3">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}

export function AssetListSkeleton({ count = 10 }) {
  return (
    <div className="space-y-2">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex items-center p-3 border rounded-md">
            <Skeleton className="h-10 w-10 rounded-md mr-3" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-8 w-16 mr-2" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
    </div>
  )
}

export function BriefBoardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {["Draft", "Review", "Approved"].map((columnId) => (
        <div key={columnId} className="flex flex-col h-full">
          <div className="mb-2 flex items-center justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>

          <div className="bg-muted/50 rounded-lg p-2 flex-1 min-h-[500px] space-y-2">
            {Array(columnId === "Draft" ? 4 : columnId === "Review" ? 3 : 2)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="mb-2">
                  <CardHeader className="p-3 pb-0">
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <Skeleton className="h-3 w-full mb-2" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex -space-x-2">
                        {Array(3)
                          .fill(0)
                          .map((_, j) => (
                            <Skeleton key={j} className="h-6 w-6 rounded-full border-2 border-background" />
                          ))}
                      </div>
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-12 rounded-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function BriefListSkeleton({ count = 10 }) {
  return (
    <div className="rounded-md border">
      <div className="bg-muted/50 p-3 border-b">
        <div className="grid grid-cols-7 gap-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-10" />
        </div>
      </div>
      <div className="divide-y">
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="p-3">
              <div className="grid grid-cols-7 gap-4 items-center">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <div className="flex -space-x-2">
                  {Array(3)
                    .fill(0)
                    .map((_, j) => (
                      <Skeleton key={j} className="h-8 w-8 rounded-full border-2 border-background" />
                    ))}
                </div>
                <Skeleton className="h-8 w-8 rounded-md ml-auto" />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export function BriefDetailSkeleton() {
  return (
    <div className="space-y-6 py-2">
      <Skeleton className="h-12 w-full" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-16" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-2">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}
