// Audius API client - free, no auth required, full-length streaming
// Docs: https://docs.audius.org/developers/api

const APP_NAME = "SpotifyCloneV0"

let cachedHost: string | null = null

// Audius has multiple discovery nodes. We fetch the list and pick one.
async function getHost(): Promise<string> {
  if (cachedHost) return cachedHost
  try {
    const res = await fetch("https://api.audius.co", { next: { revalidate: 3600 } })
    const json = await res.json()
    const hosts: string[] = json.data ?? []
    if (hosts.length === 0) throw new Error("No Audius hosts available")
    // Pick a random host to distribute load
    cachedHost = hosts[Math.floor(Math.random() * hosts.length)]
    return cachedHost!
  } catch (err) {
    // Fallback to a well-known public node
    cachedHost = "https://discoveryprovider.audius.co"
    return cachedHost
  }
}

export interface AudiusUser {
  id: string
  handle: string
  name: string
  profile_picture?: {
    "150x150"?: string
    "480x480"?: string
    "1000x1000"?: string
  }
  cover_photo?: {
    "640x"?: string
    "2000x"?: string
  }
  follower_count: number
  is_verified: boolean
}

export interface AudiusTrack {
  id: string
  title: string
  duration: number
  genre?: string
  mood?: string
  release_date?: string
  play_count: number
  favorite_count: number
  repost_count: number
  artwork?: {
    "150x150"?: string
    "480x480"?: string
    "1000x1000"?: string
  }
  user: AudiusUser
}

export interface AudiusPlaylist {
  id: string
  playlist_name: string
  description?: string
  total_play_count: number
  artwork?: {
    "150x150"?: string
    "480x480"?: string
    "1000x1000"?: string
  }
  user: AudiusUser
}

async function apiFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const host = await getHost()
  const search = new URLSearchParams({ app_name: APP_NAME, ...params })
  const url = `${host}/v1${path}?${search.toString()}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) {
    throw new Error(`Audius API error: ${res.status}`)
  }
  const json = await res.json()
  return json.data as T
}

export async function getTrendingTracks(time: "week" | "month" | "year" | "allTime" = "week"): Promise<AudiusTrack[]> {
  return apiFetch<AudiusTrack[]>("/tracks/trending", { time })
}

/**
 * Trending filtered by genre. Audius supports genres like:
 * "Latin", "Hip-Hop/Rap", "Electronic", "Pop", "R&B/Soul", "Rock", etc.
 */
export async function getTrendingTracksByGenre(
  genre: string,
  time: "week" | "month" | "year" | "allTime" = "month",
): Promise<AudiusTrack[]> {
  return apiFetch<AudiusTrack[]>("/tracks/trending", { genre, time })
}

export async function getUndergroundTrendingTracks(): Promise<AudiusTrack[]> {
  return apiFetch<AudiusTrack[]>("/tracks/trending/underground")
}

export async function searchTracks(query: string): Promise<AudiusTrack[]> {
  if (!query.trim()) return []
  return apiFetch<AudiusTrack[]>("/tracks/search", { query })
}

export async function searchUsers(query: string): Promise<AudiusUser[]> {
  if (!query.trim()) return []
  return apiFetch<AudiusUser[]>("/users/search", { query })
}

export async function searchPlaylists(query: string): Promise<AudiusPlaylist[]> {
  if (!query.trim()) return []
  return apiFetch<AudiusPlaylist[]>("/playlists/search", { query })
}

export async function getTrendingPlaylists(): Promise<AudiusPlaylist[]> {
  return apiFetch<AudiusPlaylist[]>("/playlists/trending")
}

export async function getUser(userId: string): Promise<AudiusUser> {
  return apiFetch<AudiusUser>(`/users/${userId}`)
}

export async function getUserTracks(userId: string): Promise<AudiusTrack[]> {
  return apiFetch<AudiusTrack[]>(`/users/${userId}/tracks`)
}

export async function getPlaylistTracks(playlistId: string): Promise<AudiusTrack[]> {
  return apiFetch<AudiusTrack[]>(`/playlists/${playlistId}/tracks`)
}

/**
 * Returns a direct stream URL for a track. Audius 302-redirects to the real
 * CDN mp3, which the HTML <audio> element follows automatically.
 */
export async function getStreamUrl(trackId: string): Promise<string> {
  const host = await getHost()
  return `${host}/v1/tracks/${trackId}/stream?app_name=${APP_NAME}`
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}
