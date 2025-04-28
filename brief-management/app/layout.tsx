import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { GraphQLProvider } from "./providers/ApolloProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Brief Management System",
  description: "Manage your creative briefs efficiently",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="brief-management-theme"
        >
          <GraphQLProvider>
            <div className="flex h-screen overflow-hidden bg-background text-foreground">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-14 border-b flex items-center px-4 justify-between">
                  <div className="font-semibold">Brief Management System</div>
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
              </div>
            </div>
          </GraphQLProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
