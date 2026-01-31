import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Autonomis Dashboard",
  description: "Project Management Dashboard by Chiquitín 🦀",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
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
      </body>
    </html>
  )
}
