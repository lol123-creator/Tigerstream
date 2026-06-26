'use client'

import { useEffect, useRef } from 'react'

/**
 * VideasyPlayer embeds a Videasy player inside an iframe.
 * Pattern (from Videasy docs):
 *   Movie: https://player.videasy.net/movie/{mediaId}
 *   TV:    https://player.videasy.net/tv/{mediaId}/{season}/{episode}
 *
 * Supported query params:
 *   color, progress, nextEpisode, episodeSelector,
 *   autoplayNextEpisode, overlay
 */
export function VideasyPlayer({
  type,
  mediaId,
  season,
  episode,
  title,
  autoPlay = true,
}: {
  type: 'movie' | 'tv'
  mediaId: string | number
  season?: number
  episode?: number
  title?: string
  autoPlay?: boolean
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  // container ref for fullscreen request so our custom button stays visible
  const containerRef = useRef<HTMLDivElement>(null)

  const buildUrl = () => {
    let base
    if (type === 'movie') {
      base = `https://player.videasy.net/movie/${mediaId}`
    } else {
      base = `https://player.videasy.net/tv/${mediaId}/${season}/${episode}`
    }
    const params = new URLSearchParams()
    if (autoPlay) params.set('autoplay', '1')
    const qs = params.toString()
    return qs ? `${base}?${qs}` : base
  }

  // Sync progress with the same localStorage key as Peachify
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== 'https://player.videasy.net') return
      // Videasy sends progress as JSON string in event.data
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data)
          if (data && data.id && data.progress != null) {
            localStorage.setItem('peachifyProgress', JSON.stringify(data))
          }
        } catch {}
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full pt-[56.25%] overflow-hidden rounded-xl bg-black">
      {/* Custom fullscreen button – requests fullscreen on the container so the button remains visible */}
      <button
        type="button"
        onClick={() => {
          if (containerRef.current && containerRef.current.requestFullscreen) {
            containerRef.current.requestFullscreen();
          }
        }}
        className="absolute top-2 right-2 z-10 rounded bg-black/50 px-2 py-1 text-sm text-white hover:bg-black/70"
        aria-label="Enter fullscreen"
      >
        ⛶
      </button>
      <iframe
        ref={iframeRef}
        src={buildUrl()}
        title={title || 'Video player'}
        className="absolute top-0 left-0 w-full h-full border-0"
        allowFullScreen
        webkitAllowFullScreen
        mozAllowFullScreen
        allow=\"autoplay; fullscreen; encrypted-media; picture-in-picture\"
        referrerPolicy=\"origin\"
      />
    </div>
  )
}
