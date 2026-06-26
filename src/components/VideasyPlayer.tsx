"use client"

import { useEffect, useRef, useState } from 'react'

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
  // UI visibility handling – hide the custom fullscreen button after inactivity
  const [showControls, setShowControls] = useState(true)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reset hide timer on any user interaction (mouse move or touch)
  const resetHideTimer = () => {
    setShowControls(true)
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    hideTimeoutRef.current = setTimeout(() => setShowControls(false), 3000)
  }

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

  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full pt-[56.25%] overflow-hidden rounded-xl bg-black"
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* Custom fullscreen button – only visible when showControls is true */}
      {showControls && (
        <button
          type="button"
          onClick={() => {
            // Toggle fullscreen: if already in fullscreen, exit; otherwise request it.
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else if (containerRef.current && containerRef.current.requestFullscreen) {
              containerRef.current.requestFullscreen();
            }
          }}
          className="absolute top-2 right-2 z-10 rounded bg-black/50 px-2 py-1 text-sm text-white hover:bg-black/70"
          aria-label="Enter fullscreen"
        >
          ⛶
        </button>
      )}
      <iframe
        ref={iframeRef}
        src={buildUrl()}
        title={title || 'Video player'}
        className="absolute top-0 left-0 w-full h-full border-0"
        allowFullScreen
        webkitAllowFullScreen
        mozAllowFullScreen
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        referrerPolicy="origin"
      />
    </div>
  )
}
// End of file
