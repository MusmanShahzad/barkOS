"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, LayoutGrid, List, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import BriefModal from "@/components/brief-modal"
import BriefBoard from "@/components/brief-board"
import CalendarView from "@/components/calendar-view"
import { useToast } from "@/hooks/use-toast"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()
  const pathname = usePathname()
  const router = useRouter()

  const handleCreateBrief = () => {
    setIsModalOpen(true)
  }

  const isAssetsPage = pathname === "/assets"

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <h1 className="text-lg font-semibold">Brief Management System</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button onClick={handleCreateBrief} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Brief
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
        <div className="border-b">
          <div className="flex h-10 items-center px-4 sm:px-6">
            <nav className="flex items-center space-x-4 lg:space-x-6">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  !isAssetsPage ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Briefs
              </Link>
              <Link
                href="/assets"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isAssetsPage ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Assets
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        {isAssetsPage ? (
          children
        ) : (
          <Tabs defaultValue="list" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="list" className="flex items-center">
                  <List className="mr-2 h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="board" className="flex items-center">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Board
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Calendar
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="mt-0">
              {children}
            </TabsContent>

            <TabsContent value="board" className="mt-0">
              <BriefBoard />
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              <CalendarView />
            </TabsContent>
          </Tabs>
        )}
      </main>

      <BriefModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => {
          setIsModalOpen(false)
          toast({
            title: "Brief created",
            description: "Your brief has been successfully created.",
          })
        }}
      />
    </div>
  )
}
