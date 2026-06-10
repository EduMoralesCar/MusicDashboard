"use client"

import useSWR from "swr"
import { Play, Pause, Sun, Sunrise, Moon } from "lucide-react"
import type { AudiusTrack } from "@/lib/audius"
import { TrackCard } from "./track-card"
import { TrackRow } from "./track-row"
import { SkeletonCard, SkeletonRow } from "./skeletons"
import { usePlayer } from "./player-provider"
import { cn } from "@/lib/utils"
import { useMemo } from "react"
import { AlbumCard, type DeezerAlbum } from "./album-card"

// Generic fetcher for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json()).then(data => data.data)

const fallbackAlbumRealIds: Record<string, string> = {
  latam_1: "deezer_album_316164367",
  latam_2: "deezer_album_408659277",
  latam_3: "deezer_album_332352037",
  latam_4: "deezer_album_518463332",
  latam_5: "deezer_album_1222449",
  latam_6: "deezer_album_434457587",
  latam_7: "deezer_album_90802612",
  latam_8: "deezer_album_6755148",
  latam_9: "deezer_album_408659277",
  latam_10: "deezer_album_274810622",
  latam_11: "deezer_album_334996",
  latam_12: "deezer_album_335034",
  latam_13: "deezer_album_824446221",
  latam_14: "deezer_album_395194257",
  latam_15: "deezer_album_716965901",
  latam_16: "deezer_album_123701",
  latam_17: "deezer_album_6736087",
  latam_18: "deezer_album_7441191",
  latam_19: "deezer_album_12920706",
  latam_20: "deezer_album_46566682"
}

const fallbackAlbumNames: Record<string, string> = {
  latam_1: "Un Verano Sin Ti",
  latam_2: "MAÑANA SERÁ BONITO",
  latam_3: "Bzrp Sessions Vol. 52",
  latam_4: "FERXXOCALIPSIS",
  latam_5: "Canción Animal",
  latam_6: "Desvelado",
  latam_7: "54+1",
  latam_8: "Soy Como Quiero Ser",
  latam_9: "MAÑANA SERÁ BONITO",
  latam_10: "VICE VERSA",
  latam_11: "Big Bang",
  latam_12: "Corazones",
  latam_13: "El Comienzo",
  latam_14: "Bzrp Sessions Vol. 53",
  latam_15: "Intuición",
  latam_16: "Mi Sangre",
  latam_17: "3.0",
  latam_18: "Fórmula, Vol. 2",
  latam_19: "Visualízate",
  latam_20: "Me Dejé Llevar"
}

function extractAlbumsFromTracks(tracks: AudiusTrack[]): DeezerAlbum[] {
  const seen = new Set()
  const albums: DeezerAlbum[] = []
  for (const t of tracks) {
    const albumId = fallbackAlbumRealIds[t.id] || t.album?.id || `album_${t.id}`
    if (!seen.has(albumId)) {
      seen.add(albumId)
      albums.push({
        id: albumId,
        title: t.album?.title || fallbackAlbumNames[t.id] || `${t.title} (Single)`,
        cover: t.artwork?.["480x480"] || t.artwork?.["150x150"] || "",
        artist: {
          id: t.user?.id || "",
          name: t.user?.name || "Unknown Artist"
        }
      })
    }
  }
  return albums
}

export function HomeView() {
  // Fetch real-time official Latin tracks from our server proxy with fallback safety
  const { data: trending, isLoading: loadingTrending } = useSWR<AudiusTrack[]>(
    "/api/deezer/trending?type=trending",
    fetcher
  )
  const { data: reggaeton, isLoading: loadingReggaeton } = useSWR<DeezerAlbum[]>(
    "/api/deezer/trending?type=reggaeton",
    fetcher
  )
  const { data: rockLatino, isLoading: loadingRock } = useSWR<DeezerAlbum[]>(
    "/api/deezer/trending?type=rock",
    fetcher
  )
  const { data: popLatino, isLoading: loadingPop } = useSWR<DeezerAlbum[]>(
    "/api/deezer/trending?type=pop",
    fetcher
  )
  const { data: mexico, isLoading: loadingMexico } = useSWR<DeezerAlbum[]>(
    "/api/deezer/trending?type=mexico",
    fetcher
  )
  const { data: colombia, isLoading: loadingColombia } = useSWR<DeezerAlbum[]>(
    "/api/deezer/trending?type=colombia",
    fetcher
  )
  const { data: argentina, isLoading: loadingArgentina } = useSWR<DeezerAlbum[]>(
    "/api/deezer/trending?type=argentina",
    fetcher
  )
  const { data: peru, isLoading: loadingPeru } = useSWR<DeezerAlbum[]>(
    "/api/deezer/trending?type=peru",
    fetcher
  )

  // Dynamic greeting + icons + colored gradients based on time of day
  const { greeting, icon: GreetingIcon, gradient } = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) {
      return {
        greeting: "¡Buenos días!",
        icon: Sunrise,
        gradient: "from-emerald-950/45 via-neutral-950/5 to-transparent",
      }
    }
    if (hour >= 12 && hour < 18) {
      return {
        greeting: "¡Buenas tardes!",
        icon: Sun,
        gradient: "from-amber-900/30 via-neutral-950/5 to-transparent",
      }
    }
    return {
      greeting: "¡Buenas noches!",
      icon: Moon,
      gradient: "from-indigo-950/50 via-neutral-950/5 to-transparent",
    }
  }, [])

  // Top 6 quick grid
  const topSix = trending?.slice(0, 6) ?? []

  return (
    <div className="flex flex-col gap-10 pb-16 text-white">
      {/* Premium Dynamic Time Header Banner */}
      <header
        className={cn(
          "relative -mx-6 -mt-6 flex flex-col justify-end px-6 pt-12 pb-10 bg-gradient-to-b transition-all duration-1000",
          gradient
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[#1db954] shadow-md animate-in fade-in duration-700">
            <GreetingIcon className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-white drop-shadow-sm select-none">
            {greeting}
          </h1>
        </div>

        {/* Quick picks grid */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingTrending || topSix.length === 0
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonQuickPick key={i} />)
            : topSix.map((track) => <QuickPick key={track.id} track={track} queue={topSix} />)}
        </section>
      </header>

      {/* Curated Music Carousels/Rows */}
      <div className="flex flex-col gap-12 px-1">
        <Section title="Música de Latinoamérica" subtitle="Los éxitos más reproducidos y escuchados de la región">
          <AlbumRow albums={trending ? extractAlbumsFromTracks(trending) : undefined} loading={loadingTrending} limit={18} />
        </Section>

        <Section title="Reggaetón & Urbano Hits ⚡" subtitle="Lo último en tendencias urbanas: Bad Bunny, Karol G, Feid, Rauw">
          <AlbumRow albums={reggaeton} loading={loadingReggaeton} limit={18} />
        </Section>

        <Section title="Clásicos del Rock en Español 🎸" subtitle="Himnos inmortales de Soda Stereo, Enanitos Verdes, Prisioneros">
          <AlbumRow albums={rockLatino} loading={loadingRock} limit={18} />
        </Section>

        <Section title="Joyas del Pop Latino 🌟" subtitle="Grandes baladas y éxitos pop oficiales del momento">
          <AlbumRow albums={popLatino} loading={loadingPop} limit={18} />
        </Section>

        <Section title="Vibras de Argentina 🇦🇷" subtitle="El mejor trap, pop y rock nacional del Cono Sur">
          <AlbumRow albums={argentina} loading={loadingArgentina} limit={18} />
        </Section>

        <Section title="Música de México 🇲🇽" subtitle="Corridos tumbados, mariachi y rancheras oficiales">
          <AlbumRow albums={mexico} loading={loadingMexico} limit={18} />
        </Section>

        <Section title="Sonidos de Colombia 🇨🇴" subtitle="Éxitos pop, cumbia y ritmos latinos de Colombia">
          <AlbumRow albums={colombia} loading={loadingColombia} limit={18} />
        </Section>

        <Section title="Ritmos de Perú 🇵🇪" subtitle="Clásicos de cumbia norteña peruana y pop oficial de Perú">
          <AlbumRow albums={peru} loading={loadingPeru} limit={18} />
        </Section>

        {/* Top 20 Global & LATAM chart */}
        <Section title="Top 20 del Momento" subtitle="La cartelera de éxitos más populares de esta semana">
          <div className="rounded-xl bg-card/25 border border-neutral-900/60 p-4 shadow-lg">
            <div className="grid grid-cols-[20px_4fr_3fr_2fr_60px] gap-4 border-b border-neutral-800/40 px-4 pb-3 text-xs uppercase tracking-wider text-neutral-400 font-bold">
              <div>#</div>
              <div>Título</div>
              <div className="hidden md:block">Género</div>
              <div className="hidden md:block">Popularidad</div>
              <div className="text-right">Duración</div>
            </div>
            <div className="mt-2 flex flex-col">
              {loadingTrending || !trending || trending.length === 0
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                : trending?.slice(0, 20).map((t, i) => (
                    <TrackRow key={t.id} track={t} index={i} queue={trending.slice(0, 20)} />
                  ))}
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

function AlbumRow({
  albums,
  loading,
  limit = 18,
}: {
  albums: DeezerAlbum[] | undefined
  loading: boolean
  limit?: number
}) {
  const list = useMemo(() => albums?.slice(0, limit) ?? [], [albums, limit])

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {loading && list.length === 0
        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        : list.map((album) => <AlbumCard key={album.id} album={album} />)}
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h2 className="text-2xl font-extrabold tracking-tight text-white hover:text-[#1db954] cursor-pointer transition-colors duration-250 w-fit">
          {title}
        </h2>
        {subtitle && <p className="text-sm text-neutral-400 font-medium mt-1">{subtitle}</p>}
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
      className="group flex items-center gap-4 overflow-hidden rounded-md bg-white/5 border border-white/[0.05] hover:bg-white/10 hover:border-white/[0.12] text-left transition-all duration-300 shadow-md hover:shadow-xl active:scale-[0.99]"
    >
      <div
        className="h-20 w-20 shrink-0 bg-neutral-800 bg-cover bg-center shadow-md transition-all duration-500 group-hover:scale-103"
        style={cover ? { backgroundImage: `url(${cover})` } : undefined}
      />
      <div className="min-w-0 flex-1 px-1">
        <div className={cn("truncate text-sm font-extrabold", isCurrent ? "text-[#1db954]" : "text-white")}>
          {track.title}
        </div>
        <div className="truncate text-xs text-neutral-400 font-semibold mt-0.5">{track.user.name}</div>
      </div>
      <span
        className={cn(
          "mr-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1db954] text-black opacity-0 shadow-lg shadow-black/45 transition-all translate-y-1.5 duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 hover:bg-[#1ed760] active:scale-95",
          isCurrent && "opacity-100 translate-y-0 bg-[#1db954] text-black",
        )}
      >
        {showPause ? (
          <Pause className="h-5 w-5" fill="currentColor" />
        ) : (
          <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
        )}
      </span>
    </button>
  )
}

function SkeletonQuickPick() {
  return (
    <div className="flex h-20 animate-pulse items-center gap-4 rounded-md bg-white/5 border border-white/[0.03] px-3 py-2">
      <div className="h-16 w-16 rounded bg-neutral-800 shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3 w-3/4 rounded bg-neutral-800" />
        <div className="h-2 w-1/2 rounded bg-neutral-800" />
      </div>
    </div>
  )
}
