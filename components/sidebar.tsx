"use client"

import { Home, Search, Library, Plus, Heart, Music2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLiked } from "./liked-provider"

export type View = "home" | "search" | "library" | "liked"

interface SidebarProps {
  view: View
  onViewChange: (v: View) => void
}

export function Sidebar({ view, onViewChange }: SidebarProps) {
  const { liked } = useLiked()

  const navItems: { id: View; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "library", label: "Your Library", icon: Library },
  ]

  // Suggested latin-flavored quick playlists. Clicking any routes to Search so the
  // user sees real results for that theme.
  const quickPlaylists: { name: string; query: string; hue: number }[] = [
    { name: "Reggaeton Hits", query: "reggaeton", hue: 340 },
    { name: "Musica Mexicana", query: "mexico", hue: 20 },
    { name: "Sonido Colombia", query: "colombia", hue: 150 },
    { name: "Argentina Vibes", query: "argentina", hue: 210 },
    { name: "Puerto Rico", query: "puerto rico", hue: 280 },
    { name: "Peru Sounds", query: "peru", hue: 50 },
    { name: "Bachata & Salsa", query: "bachata", hue: 10 },
    { name: "Latin Trap", query: "latin trap", hue: 300 },
  ]

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-2 bg-sidebar p-2 text-sidebar-foreground">
      {/* Logo + main nav */}
      <div className="rounded-lg bg-card p-4">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Music2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">Wavify</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex items-center gap-4 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Library */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-card">
        <div className="flex items-center justify-between p-4 pb-2">
          <button
            onClick={() => onViewChange("library")}
            className="flex items-center gap-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-sidebar-foreground"
          >
            <Library className="h-5 w-5" />
            Your Library
          </button>
          <button
            aria-label="Create playlist"
            onClick={() => onViewChange("liked")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <button
            onClick={() => onViewChange("liked")}
            className={cn(
              "mb-1 flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent",
              view === "liked" && "bg-sidebar-accent",
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent">
              <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Liked Songs</div>
              <div className="truncate text-xs text-muted-foreground">
                Playlist · {liked.length} song{liked.length === 1 ? "" : "s"}
              </div>
            </div>
          </button>

          {quickPlaylists.map((p, i) => (
            <button
              key={p.name}
              onClick={() => {
                // Jump into Search and preload this query via URL hash
                if (typeof window !== "undefined") {
                  window.location.hash = `q=${encodeURIComponent(p.query)}`
                }
                onViewChange("search")
              }}
              className="mb-1 flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                style={{
                  background: `linear-gradient(135deg, oklch(0.55 0.2 ${p.hue}), oklch(0.32 0.12 ${(p.hue + 40) % 360}))`,
                }}
              >
                <Music2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{p.name}</div>
                <div className="truncate text-xs text-muted-foreground">Playlist · Latin</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
