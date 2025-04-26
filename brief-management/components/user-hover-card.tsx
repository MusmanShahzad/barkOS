"use client"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function UserHoverCard({ user, children, isLoading = false, trigger = null }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{trigger || children}</HoverCardTrigger>
      <HoverCardContent className="w-80" align="start">
        {isLoading ? (
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-sm font-semibold">{user?.name}</h4>
                <p className="text-sm text-muted-foreground">{user?.role}</p>
                <Badge
                  variant="outline"
                  className={`mt-1 ${
                    user?.status === "Active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                  }`}
                >
                  {user?.status}
                </Badge>
              </div>
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="mr-2 h-4 w-4" />
              {user?.email}
            </div>

            {user?.phone && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="mr-2 h-4 w-4" />
                {user.phone}
              </div>
            )}

            {user?.location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                {user.location}
              </div>
            )}

            <div className="flex items-center pt-2">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Joined {new Date(user?.joinedAt || Date.now()).toLocaleDateString()}
              </span>
            </div>

            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" className="w-full">
                View Profile
              </Button>
              <Button size="sm" className="w-full">
                Message
              </Button>
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}
