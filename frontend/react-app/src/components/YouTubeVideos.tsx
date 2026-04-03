import { useEffect, useState } from 'react'

type VideoSource = {
  title: string
  videoId: string
  thumbnail: string
  published: string
  summary: string
}

const YT_CHANNEL_ID = 'UCNzXqekLV-uxTXIkrTxUY1Q'
const YT_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`
const FALLBACK_VIDEO_IDS = ['vYxIQtsnhUs', 'hvSbdaIdL2A', '_adAIH_Lh0g', 'R3F_utFI2Rk', 'GJJeWwhsKFU', 'TDyG9mVPt2Q']

const FEED_SOURCES = [
  { type: 'xml' as const, buildUrl: (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` },
  { type: 'xml' as const, buildUrl: (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}` },
  { type: 'page' as const, buildUrl: () => 'https://r.jina.ai/http://www.youtube.com/user/vivekanjan/videos' },
  { type: 'json' as const, buildUrl: (url: string) => `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}` },
]

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function extractVideoIdFromLink(link: string) {
  const match = link.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : ''
}

function extractVideoIdsFromPage(pageText: string) {
  const matches = pageText.match(/watch\?v=([a-zA-Z0-9_-]{11})/g) || []
  const seen = new Set<string>()
  const ids: string[] = []

  matches.forEach((match) => {
    const id = match.split('watch?v=')[1]
    if (id && !seen.has(id)) {
      seen.add(id)
      ids.push(id)
    }
  })

  return ids
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  let timeoutId: number | undefined

  if (controller) {
    timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)
  }

  try {
    return await fetch(url, controller ? { signal: controller.signal } : undefined)
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId)
  }
}

async function fetchWithFallback(url: string) {
  for (let index = 0; index < FEED_SOURCES.length; index += 1) {
    const source = FEED_SOURCES[index]
    try {
      const sourceUrl = source.buildUrl(url)
      const response = await fetchWithTimeout(sourceUrl, 7000)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      if (source.type === 'xml') {
        const text = await response.text()
        if (!text.includes('<feed') && !text.includes('<entry')) throw new Error('Not a feed')
        return { type: 'xml' as const, data: text }
      }

      if (source.type === 'page') {
        const text = await response.text()
        const ids = extractVideoIdsFromPage(text)
        if (!ids.length) throw new Error('No video IDs found in page source')
        return { type: 'ids' as const, data: ids }
      }

      const json = await response.json()
      if (!json || json.status !== 'ok' || !Array.isArray(json.items)) {
        throw new Error('Bad JSON feed payload')
      }
      return { type: 'json' as const, data: json.items }
    } catch (error) {
      if (index === FEED_SOURCES.length - 1) throw error
    }
  }

  throw new Error('No feed source available')
}

export function YouTubeVideos() {
  const [videos, setVideos] = useState<VideoSource[]>([])
  const [loading, setLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState<VideoSource | null>(null)

  useEffect(() => {
    let alive = true

    async function loadVideos() {
      try {
        const result = await fetchWithFallback(YT_FEED_URL)
        if (!alive) return

        if (result.type === 'xml') {
          const xml = new DOMParser().parseFromString(result.data, 'application/xml')
          const entries = Array.from(xml.getElementsByTagNameNS('*', 'entry')).slice(0, 6)
          const mapped = entries
            .map((entry) => {
              const videoId = entry.getElementsByTagNameNS('*', 'videoId')[0]?.textContent?.trim() || ''
              if (!videoId) return null
              const title = entry.getElementsByTagNameNS('*', 'title')[0]?.textContent?.trim() || 'Latest Video'
              const published = entry.getElementsByTagNameNS('*', 'published')[0]?.textContent?.trim() || ''
              const thumbnail = entry.getElementsByTagNameNS('*', 'thumbnail')[0]?.getAttribute('url') || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
              return { title, videoId, thumbnail, published: formatDate(published), summary: 'Latest upload from the YouTube channel.' }
            })
            .filter((item): item is VideoSource => item !== null)

          setVideos(mapped)
          return
        }

        if (result.type === 'ids') {
          setVideos(
            result.data.slice(0, 6).map((videoId) => ({
              title: 'Latest Video',
              videoId,
              thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              published: 'From YouTube channel',
              summary: 'Latest upload from the YouTube channel.',
            })),
          )
          return
        }

        setVideos(
          result.data.slice(0, 6).flatMap((item: Record<string, unknown>) => {
            const link = typeof item.link === 'string' ? item.link : ''
            const videoId = extractVideoIdFromLink(link)
            if (!videoId) return []
            const title = typeof item.title === 'string' ? item.title.trim() : 'Latest Video'
            const thumbnail = typeof item.thumbnail === 'string' && item.thumbnail ? item.thumbnail : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
            const published = typeof item.pubDate === 'string' ? formatDate(item.pubDate) : 'From YouTube channel'
            return [{ title, videoId, thumbnail, published, summary: 'Latest upload from the YouTube channel.' }]
          }),
        )
      } catch {
        if (!alive) return
        setVideos(
          FALLBACK_VIDEO_IDS.map((videoId) => ({
            title: 'Latest Video',
            videoId,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            published: 'From YouTube channel',
            summary: 'Latest upload from the YouTube channel.',
          })),
        )
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadVideos()

    return () => {
      alive = false
    }
  }, [])

  return (
    <>
      <div className="sidebar-video-list">
        {loading ? <p className="sidebar-video-status">Loading latest videos…</p> : null}
        {!loading && !videos.length ? <p className="sidebar-video-status">No videos found.</p> : null}
        {videos.map((video) => (
          <button key={video.videoId} type="button" className="sidebar-video-card" onClick={() => setActiveVideo(video)}>
            <div className="sidebar-thumb">
              <img src={video.thumbnail} alt={video.title} />
              <div className="sidebar-play">
                <i className="fa-solid fa-play" aria-hidden="true" />
              </div>
            </div>
            <div className="sidebar-video-info">
              <h4>{video.title}</h4>
              <p className="sidebar-video-summary">{video.summary}</p>
              <span>{video.published || 'From YouTube channel'}</span>
            </div>
          </button>
        ))}
      </div>

      <a href="https://www.youtube.com/user/vivekanjan" target="_blank" rel="noreferrer" className="yt-see-all">
        <i className="fa-brands fa-youtube" aria-hidden="true" /> See all on YouTube
      </a>

      {activeVideo ? (
        <div className="video-modal active" role="dialog" aria-modal="true" onClick={() => setActiveVideo(null)}>
          <div className="modal-inner" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setActiveVideo(null)}>
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
            <div className="iframe-wrap">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={activeVideo.title}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
            <div className="modal-title">{activeVideo.title}</div>
          </div>
        </div>
      ) : null}
    </>
  )
}
