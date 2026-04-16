"use client"

import { ChevronLeft, ChevronRight, User } from "lucide-react"

export function TopBar() {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-background/80 px-6 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <button
          aria-label="Back"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-card/80 text-foreground transition-colors hover:bg-card"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Forward"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-card/80 text-muted-foreground transition-colors hover:bg-card"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button className="hidden rounded-full bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent sm:block">
          Explore Premium
        </button>
        <button className="hidden text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground md:block">
          Install App
        </button>
        <button
          aria-label="Profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
