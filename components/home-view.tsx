"use client"

import useSWR from "swr"
import { Play, Pause } from "lucide-react"
import {
  getTrendingTracks,
  getUndergroundTrendingTracks,
  getTrendingTracksByGenre,
  searchTracks,
  type AudiusTrack,
} from "@/lib/audius"
import { TrackCard } from "./track-card"
import { TrackRow } from "./track-row"
import { SkeletonCard, SkeletonRow } from "./skeletons"
import { usePlayer } from "./player-provider"
import { cn } from "@/lib/utils"

export function HomeView() {
  const { data: trending, isLoading: loadingTrending } = useSWR<AudiusTrack[]>("trending-week", () =>
    getTrendingTracks("week"),
  )
  const { data: underground, isLoading: loadingUnderground } = useSWR<AudiusTrack[]>(
    "underground-trending",
    getUndergroundTrendingTracks,
  )

  // Latin-genre trending from Audius
  const { data: latin, isLoading: loadingLatin } = useSWR<AudiusTrack[]>("trending-latin", () =>
    getTrendingTracksByGenre("Latin", "month"),
  )

  // Country-specific searches — Audius text search finds tracks/artists tagged accordingly
  const { data: reggaeton } = useSWR<AudiusTrack[]>("search-reggaeton", () => searchTracks("reggaeton"))
  const { data: mexico } = useSWR<AudiusTrack[]>("search-mexico", () => searchTracks("mexico"))
  const { data: colombia } = useSWR<AudiusTrack[]>("search-colombia", () => searchTracks("colombia"))
  const { data: argentina } = useSWR<AudiusTrack[]>("search-argentina", () => searchTracks("argentina"))
  const { data: puertoRico } = useSWR<AudiusTrack[]>("search-pr", () => searchTracks("puerto rico"))
  const { data: peru } = useSWR<AudiusTrack[]>("search-peru", () => searchTracks("peru"))

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  const topSix = trending?.slice(0, 6) ?? []

  return (
    <div className="flex flex-col gap-8 pb-8">
      <header>
        <h1 className="text-balance text-3xl font-bold tracking-tight">{greeting}</h1>
      </header>

      {/* Quick picks grid */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loadingTrending
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-md bg-card" />)
          : topSix.map((track) => <QuickPick key={track.id} track={track} queue={topSix} />)}
      </section>

      <Section title="Trending this week" subtitle="The hottest tracks right now">
        <CardRow tracks={trending} loading={loadingTrending} limit={12} />
      </Section>

      <Section title="Latin heat" subtitle="Trending across Latin America">
        <CardRow tracks={latin} loading={loadingLatin} limit={12} />
      </Section>

      <Section title="Reggaeton hits" subtitle="Perreo, dembow and trap latino">
        <CardRow tracks={reggaeton} loading={!reggaeton} limit={12} />
      </Section>

      <Section title="Sonido Mexico" subtitle="From corridos to rock mexicano">
        <CardRow tracks={mexico} loading={!mexico} limit={12} />
      </Section>

      <Section title="Colombia en la casa" subtitle="Cumbia, vallenato y mas">
        <CardRow tracks={colombia} loading={!colombia} limit={12} />
      </Section>

      <Section title="Argentina suena" subtitle="Rock nacional, trap y tango moderno">
        <CardRow tracks={argentina} loading={!argentina} limit={12} />
      </Section>

      <Section title="Puerto Rico vibes" subtitle="La cuna del reggaeton">
        <CardRow tracks={puertoRico} loading={!puertoRico} limit={12} />
      </Section>

      <Section title="Peru sounds" subtitle="Cumbia peruana, chicha y mas">
        <CardRow tracks={peru} loading={!peru} limit={12} />
      </Section>

      <Section title="Underground picks" subtitle="Fresh finds off the beaten path">
        <CardRow tracks={underground} loading={loadingUnderground} limit={12} />
      </Section>

      <Section title="Top 20 right now" subtitle="The global chart">
        <div className="rounded-lg bg-card/50 p-2">
          <div className="grid grid-cols-[16px_4fr_3fr_2fr_60px] gap-4 border-b border-border px-4 pb-2 text-xs uppercase tracking-wider text-muted-foreground">
            <div>#</div>
            <div>Title</div>
            <div className="hidden md:block">Genre</div>
            <div className="hidden md:block">Plays</div>
            <div className="text-right">Time</div>
          </div>
          <div className="mt-2 flex flex-col">
            {loadingTrending
              ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
              : trending
                  ?.slice(0, 20)
                  .map((t, i) => <TrackRow key={t.id} track={t} index={i} queue={trending.slice(0, 20)} />)}
          </div>
        </div>
      </Section>
    </div>
  )
}

function CardRow({
  tracks,
  loading,
  limit = 12,
}: {
  tracks: AudiusTrack[] | undefined
  loading: boolean
  limit?: number
}) {
  const list = tracks?.slice(0, limit) ?? []
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {loading && list.length === 0
        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        : list.length === 0
          ? (
              <p className="col-span-full text-sm text-muted-foreground">No tracks available right now.</p>
            )
          : list.map((t) => <TrackCard key={t.id} track={t} queue={tracks ?? []} />)}
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function QuickPick({ track, queue }: { track: AudiusTrack; queue: AudiusTrack[] }) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const isCurrent = currentTrack?.id === track.id
  const showPause = isCurrent && isPlaying
  const cover = track.artwork?.["150x150"] || track.artwork?.["480x480"]

  const handleClick = () => {
    if (isCurrent) togglePlay()
    else playTrack(track, queue)
  }

  return (
    <button
      onClick={handleClick}
      className="group flex items-center gap-3 overflow-hidden rounded-md bg-card text-left transition-colors hover:bg-accent"
    >
      <div
        className="h-20 w-20 shrink-0 bg-muted bg-cover bg-center"
        style={cover ? { backgroundImage: `url(${cover})` } : undefined}
      />
      <span className="min-w-0 flex-1 truncate px-2 text-sm font-semibold">{track.title}</span>
      <span
        className={cn(
          "mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all group-hover:opacity-100",
          isCurrent && "opacity-100",
        )}
      >
        {showPause ? (
          <Pause className="h-4 w-4" fill="currentColor" />
        ) : (
          <Play className="h-4 w-4 translate-x-[1px]" fill="currentColor" />
        )}
      </span>
    </button>
  )
}
