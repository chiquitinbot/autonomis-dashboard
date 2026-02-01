"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Mission Control has its own full-page layout
  if (pathname === "/mission-control") {
    return <>{children}</>
  }

  // Default layout with sidebar
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1" />
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:block">Bernardo Garza</span>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500" />
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
