import type { AudiusTrack } from "./audius"

export interface LatamTrack extends AudiusTrack {
  streamUrl: string
}

// Custom curated Spotify LATAM Hits list (20 major hits) using high-definition, 100% reliable Unsplash cover art and profiles
export const LATAM_HITS: LatamTrack[] = [
  {
    id: "latam_1",
    title: "Ojitos Lindos",
    duration: 265,
    genre: "Reggaeton / Indie Pop",
    mood: "Romantic",
    play_count: 987541200,
    favorite_count: 5412000,
    repost_count: 320000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80"
    },
    user: {
      id: "deezer_artist_4697334",
      handle: "badbunny",
      name: "Bad Bunny & Bomba Estéreo",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=150&q=80"
      },
      follower_count: 78000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: "latam_2",
    title: "PROVENZA",
    duration: 210,
    genre: "Reggaeton / Urbano / Colombia",
    mood: "Chill Vibes",
    play_count: 852100400,
    favorite_count: 4890000,
    repost_count: 245000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"
    },
    user: {
      id: "deezer_artist_4493015",
      handle: "karolg",
      name: "KAROL G",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&q=80"
      },
      follower_count: 45000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: "latam_3",
    title: "Quevedo: Bzrp Music Sessions, Vol. 52",
    duration: 200,
    genre: "Latin Trap / EDM / Argentina",
    mood: "Party",
    play_count: 1250000000,
    favorite_count: 9800000,
    repost_count: 654000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80"
    },
    user: {
      id: "deezer_artist_59714852",
      handle: "bizarrap",
      name: "Bizarrap & Quevedo",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80"
      },
      follower_count: 32000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: "latam_4",
    title: "LUNA",
    duration: 196,
    genre: "Reggaeton / Urbano / Colombia",
    mood: "Melancholic",
    play_count: 620000000,
    favorite_count: 3800000,
    repost_count: 180000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80"
    },
    user: {
      id: "deezer_artist_10583404",
      handle: "feid",
      name: "Feid & ATL Jacob",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=150&q=80"
      },
      follower_count: 24000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: "latam_5",
    title: "De Música Ligera",
    duration: 212,
    genre: "Rock Latino / Classic / Argentina",
    mood: "Energetic",
    play_count: 450000000,
    favorite_count: 2800000,
    repost_count: 140000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80"
    },
    user: {
      id: "deezer_artist_412",
      handle: "sodastereo",
      name: "Soda Stereo",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1482440308425-276ad0f28b19?w=150&q=80"
      },
      follower_count: 12000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  {
    id: "latam_6",
    title: "Ella Baila Sola",
    duration: 165,
    genre: "Regional Mexicano / Corridos / Mexico",
    mood: "Festive",
    play_count: 1100000000,
    favorite_count: 8500000,
    repost_count: 590000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80"
    },
    user: {
      id: "deezer_artist_146059122",
      handle: "pesopluma",
      name: "Eslabon Armado & Peso Pluma",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=150&q=80"
      },
      follower_count: 18000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: "latam_7",
    title: "Me Rehúso",
    duration: 205,
    genre: "Latin Pop / Dancehall / Venezuela",
    mood: "Happy",
    play_count: 1400000000,
    favorite_count: 9900000,
    repost_count: 420000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=800&q=80"
    },
    user: {
      id: "deezer_artist_11370216",
      handle: "dannyocean",
      name: "Danny Ocean",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1453090927415-5f45085b65c0?w=150&q=80"
      },
      follower_count: 11000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  },
  {
    id: "latam_8",
    title: "Ahora Te Puedes Marchar",
    duration: 192,
    genre: "Pop / Classic Latino / Mexico",
    mood: "Dance / Retro",
    play_count: 530000000,
    favorite_count: 3200000,
    repost_count: 120000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80"
    },
    user: {
      id: "deezer_artist_1107",
      handle: "luismiguel",
      name: "Luis Miguel",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1513829096999-4978602294fc?w=150&q=80"
      },
      follower_count: 22000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
  {
    id: "latam_9",
    title: "TQG",
    duration: 199,
    genre: "Reggaeton / Urbano / Colombia",
    mood: "Sassy",
    play_count: 730000000,
    favorite_count: 5100000,
    repost_count: 310000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80"
    },
    user: {
      id: "deezer_artist_4493015",
      handle: "karolg",
      name: "KAROL G & Shakira",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=150&q=80"
      },
      follower_count: 45000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
  },
  {
    id: "latam_10",
    title: "Todo de Ti",
    duration: 200,
    genre: "Synth Pop / Dance / Puerto Rico",
    mood: "Energetic / Happy",
    play_count: 940000000,
    favorite_count: 6200000,
    repost_count: 290000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80"
    },
    user: {
      id: "deezer_artist_11986423",
      handle: "rauwalejandro",
      name: "Rauw Alejandro",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1525683879097-9419b161502f?w=150&q=80"
      },
      follower_count: 20000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  },
  {
    id: "latam_11",
    title: "Lamento Boliviano",
    duration: 225,
    genre: "Rock Latino / Classic / Argentina",
    mood: "Nostalgic",
    play_count: 380000000,
    favorite_count: 1900000,
    repost_count: 85000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1482440308425-276ad0f28b19?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1482440308425-276ad0f28b19?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1482440308425-276ad0f28b19?w=800&q=80"
    },
    user: {
      id: "deezer_artist_1196",
      handle: "enanitosverdes",
      name: "Los Enanitos Verdes",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=150&q=80"
      },
      follower_count: 8000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3"
  },
  {
    id: "latam_12",
    title: "Tren al Sur",
    duration: 240,
    genre: "Rock Latino / Synthpop / Chile",
    mood: "Nostalgic",
    play_count: 220000000,
    favorite_count: 1400000,
    repost_count: 65000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=800&q=80"
    },
    user: {
      id: "deezer_artist_8050",
      handle: "losprisioneros",
      name: "Los Prisioneros",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&q=80"
      },
      follower_count: 5000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3"
  },
  {
    id: "latam_13",
    title: "un x100to",
    duration: 206,
    genre: "Regional Mexicano / Grupero / Mexico / Puerto Rico",
    mood: "Nostalgic / Romantic",
    play_count: 890000000,
    favorite_count: 6100000,
    repost_count: 340000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1513829096999-4978602294fc?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1513829096999-4978602294fc?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1513829096999-4978602294fc?w=800&q=80"
    },
    user: {
      id: "deezer_artist_160416972",
      handle: "grupofrontera",
      name: "Grupo Frontera & Bad Bunny",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=150&q=80"
      },
      follower_count: 14000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3"
  },
  {
    id: "latam_14",
    title: "Shakira: Bzrp Music Sessions, Vol. 53",
    duration: 217,
    genre: "Latin Pop / Electropop / Colombia / Argentina",
    mood: "Empowered / Upbeat",
    play_count: 980000000,
    favorite_count: 7500000,
    repost_count: 480000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1453090927415-5f45085b65c0?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1453090927415-5f45085b65c0?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1453090927415-5f45085b65c0?w=800&q=80"
    },
    user: {
      id: "deezer_artist_161",
      handle: "shakira",
      name: "Shakira & Bizarrap",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=150&q=80"
      },
      follower_count: 55000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3"
  },
  {
    id: "latam_15",
    title: "Sácala a Bailar",
    duration: 198,
    genre: "Latin Pop / Tropical / Peru",
    mood: "Festive / Dancing",
    play_count: 45000005,
    favorite_count: 320000,
    repost_count: 15000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80"
    },
    user: {
      id: "deezer_artist_78502",
      handle: "gianmarco",
      name: "Gian Marco",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=150&q=80"
      },
      follower_count: 3000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3"
  },
  {
    id: "latam_16",
    title: "La Camisa Negra",
    duration: 216,
    genre: "Rock Latino / Pop / Colombia",
    mood: "Energetic",
    play_count: 520000000,
    favorite_count: 3500000,
    repost_count: 180000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
    },
    user: {
      id: "deezer_artist_1251",
      handle: "juanes",
      name: "Juanes",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&q=80"
      },
      follower_count: 15000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"
  },
  {
    id: "latam_17",
    title: "Vivir Mi Vida",
    duration: 252,
    genre: "Salsa / Tropical / Latin",
    mood: "Celebration",
    play_count: 820000000,
    favorite_count: 5800000,
    repost_count: 220000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80"
    },
    user: {
      id: "deezer_artist_1068",
      handle: "marcanthony",
      name: "Marc Anthony",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=150&q=80"
      },
      follower_count: 18000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: "latam_18",
    title: "Propuesta Indecente",
    duration: 235,
    genre: "Bachata / Latin / Republica Dominicana",
    mood: "Sensual",
    play_count: 650000000,
    favorite_count: 4200000,
    repost_count: 150000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1513829096999-4978602294fc?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1513829096999-4978602294fc?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1513829096999-4978602294fc?w=800&q=80"
    },
    user: {
      id: "deezer_artist_1266205",
      handle: "romeosantos",
      name: "Romeo Santos",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=150&q=80"
      },
      follower_count: 22000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: "latam_19",
    title: "La Gozadera",
    duration: 203,
    genre: "Salsa / Tropical / Cuba",
    mood: "Joyful",
    play_count: 480000000,
    favorite_count: 2900000,
    repost_count: 98000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1453090927415-5f45085b65c0?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1453090927415-5f45085b65c0?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1453090927415-5f45085b65c0?w=800&q=80"
    },
    user: {
      id: "deezer_artist_117769",
      handle: "gentedezona",
      name: "Gente de Zona & Marc Anthony",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=150&q=80"
      },
      follower_count: 5000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: "latam_20",
    title: "Adiós Amor",
    duration: 200,
    genre: "Regional Mexicano / Mariachi / Mexico",
    mood: "Sad / Heartbroken",
    play_count: 610000000,
    favorite_count: 4100000,
    repost_count: 140000,
    artwork: {
      "150x150": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=150&q=80",
      "480x480": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=480&q=80",
      "1000x1000": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80"
    },
    user: {
      id: "deezer_artist_11603598",
      handle: "christiannodal",
      name: "Christian Nodal",
      profile_picture: {
        "150x150": "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=150&q=80"
      },
      follower_count: 15000000,
      is_verified: true
    },
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  }
]

// Helper function to resolve stream url for custom tracks
export function getLocalStreamUrl(trackId: string): string | null {
  const track = LATAM_HITS.find((t) => t.id === trackId)
  return track ? track.streamUrl : null
}
