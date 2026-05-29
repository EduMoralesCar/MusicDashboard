import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")

    if (!q) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 })
    }

    // Call YouTube search directly server-side
    // Using a standard User-Agent header makes it return the full desktop HTML page reliably
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " official audio")}`
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"
      },
      next: { revalidate: 86400 } // cache the result for 24 hours to make it blazing fast!
    })

    if (!response.ok) {
      throw new Error(`YouTube returned status ${response.status}`)
    }

    const html = await response.text()

    // Regular expression to match video IDs from watch links in the HTML
    // We look for watch?v=XXXXXXXXXXX which are standard video IDs
    const regex = /\/watch\?v=([a-zA-Z0-9_-]{11})/g
    const matches: string[] = []
    let match

    // Collect the first few video IDs
    while ((match = regex.exec(html)) !== null) {
      if (match[1] && !matches.includes(match[1])) {
        matches.push(match[1])
      }
      if (matches.length >= 5) break // collect up to 5 unique ids
    }

    if (matches.length === 0) {
      console.log(`⚠️ No video found for query: ${q}`)
      return NextResponse.json({ error: "No video found" }, { status: 404 })
    }

    // Return the first video ID found
    const videoId = matches[0]
    return NextResponse.json({ videoId })
  } catch (error: any) {
    console.error("❌ Error in YouTube search proxy:", error)
    return NextResponse.json({ error: "Error searching YouTube" }, { status: 500 })
  }
}
