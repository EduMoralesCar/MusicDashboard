"use client"

import Image from "next/image"
import { User, BadgeCheck } from "lucide-react"
import type { AudiusUser } from "@/lib/audius"
import { formatCount } from "@/lib/audius"
import { useNavigation } from "./navigation-provider"

export function ArtistCard({ user }: { user: AudiusUser }) {
  const { navigateToArtist } = useNavigation()
  const photo = user.profile_picture?.["480x480"] || user.profile_picture?.["150x150"] || null

  return (
    <div 
      onClick={() => navigateToArtist(user.id, user.name)}
      className="group cursor-pointer rounded-lg bg-card p-4 transition-colors hover:bg-accent active:scale-[0.98] select-none"
    >
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-full bg-muted shadow-lg">
        {photo ? (
          <Image
            src={photo || "/placeholder.svg"}
            alt={user.name}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
            className="object-cover transition-transform duration-300 group-hover:scale-103"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="flex items-center gap-1 truncate text-sm font-semibold text-card-foreground group-hover:text-[#1db954] transition-colors">
          <span className="truncate">{user.name}</span>
          {user.is_verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" fill="currentColor" stroke="var(--card)" />}
        </h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {formatCount(user.follower_count)} oyentes · Artista
        </p>
      </div>
    </div>
  )
}
