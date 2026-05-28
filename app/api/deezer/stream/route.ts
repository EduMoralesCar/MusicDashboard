import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing track ID" }, { status: 400 })
    }

    // Call Deezer track details API server-side
    const res = await fetch(`https://api.deezer.com/track/${id}`, {
      next: { revalidate: 3600 } // cache for 1 hour
    })

    if (!res.ok) {
      throw new Error(`Deezer API returned status ${res.status}`)
    }

    const track = await res.json()

    if (!track || !track.preview) {
      return NextResponse.json({ error: "No preview stream available for this track" }, { status: 404 })
    }

    // Return the official preview streaming URL
    return NextResponse.json({ url: track.preview })
  } catch (error: any) {
    console.error("❌ Error in Deezer stream proxy:", error)
    return NextResponse.json({ error: "Error fetching official audio stream" }, { status: 500 })
  }
}
