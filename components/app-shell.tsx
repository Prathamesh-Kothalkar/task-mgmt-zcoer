"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CheckSquare, Bell, User, LogOut, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"

const navItems = [
  { label: "Home", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Staff", icon: Users, href: "/staff" },
  { label: "Tasks", icon: CheckSquare, href: "/tasks" },
  { label: "Inbox", icon: Bell, href: "/notifications" },
  { label: "Me", icon: User, href: "/profile" },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  
  const user = session?.user



  const activeItem = navItems.find((item) => pathname.startsWith(item.href)) || navItems[0]

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 border-r bg-card">
        <div className="p-6 flex items-center space-x-3 border-b">
          <div className="relative w-10 h-10">
            <Image src="/images/images.png" alt="Zeal Logo" fill className="object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight text-primary">ZEAL COLLEGE</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Task Manager</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group",
                pathname.startsWith(item.href)
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  pathname.startsWith(item.href) ? "text-primary-foreground" : "group-hover:text-primary",
                )}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="bg-muted/50 rounded-xl p-3 flex items-center space-x-3">
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">HK</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name || "Login to view"}</p>
              <p className="text-[10px] text-muted-foreground truncate uppercase">{user?.deptName || "Login to view"}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => signOut()}>
              <LogOut className="h-4 w-4"  />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Desktop Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-md px-4 md:px-6">
          <div className="lg:hidden flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image src="/images/images.png" alt="Zeal Logo" fill className="object-contain" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <span className="hidden sm:inline">Management</span>
              <ChevronRight className="h-3 w-3 hidden sm:inline" />
              <span className="text-primary font-bold">{activeItem.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                {user?.deptName || "Login to view  "}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
            </Button>
            <Link href="/profile" className="lg:hidden active:scale-95 transition-transform">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-primary text-primary-foreground">HK</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">{children}</div>

        {/* Mobile Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t px-1 pb-safe pt-2 flex justify-around items-center shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-300 min-w-[68px] relative overflow-hidden active:scale-90",
                pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground/80",
              )}
            >
              {pathname.startsWith(item.href) && (
                <div className="absolute top-0 w-8 h-1 bg-primary rounded-full animate-in slide-in-from-top-1 duration-300" />
              )}
              <item.icon
                className={cn(
                  "h-[22px] w-[22px] mb-1.5 transition-transform duration-300",
                  pathname.startsWith(item.href) ? "stroke-[2.5px] scale-110" : "stroke-[1.8px]",
                )}
              />
              <span
                className={cn(
                  "text-[9px] font-bold uppercase tracking-[0.05em] transition-all duration-300",
                  pathname.startsWith(item.href) ? "opacity-100 translate-y-0" : "opacity-70",
                )}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  )
}
