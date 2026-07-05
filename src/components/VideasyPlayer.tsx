"use client"

import { useEffect, useRef, useState } from 'react'
import { mergePeachifyProgress, type PeachifyProgressStore } from '@/peachify'

/**
 * VideasyPlayer embeds a Videasy player inside an iframe.
 *
 * Domain migrated from player.videasy.net -> player.videasy.to
 * (the .net domain is deprecated; see Videasy's own recent announcements).
 *
 * URL pattern (confirmed current, e.g. player.videasy.to/movie/1159559?...):
 *   Movie: https://player.videasy.to/movie/{mediaId}
 *   TV:    https://player.videasy.to/tv/{mediaId}/{season}/{episode}
 *
 * Confirmed query params: color (hex, no #), episodeSelector, nextEpisode,
 * autoplayNextEpisode, overlay.
 *
 * Known third-party issue (not fixable client-side): Videasy's player
 * hijacks the first click on play to open an ad tab, and actively
 * detects/blocks the sandbox iframe attribute that would normally
 * prevent that popup.
 */
const ORIGIN = 'https://player.videasy.to'

export function VideasyPlayer({
  type,
  mediaId,
  season,
  episode,
  title,
  autoPlay = true,
  onMediaData,
}: {
  type: 'movie' | 'tv'
  mediaId: string | number
  season?: number
  episode?: number
  title?: string
  autoPlay?: boolean
  /** Called after a MEDIA_DATA payload has been merged into storage. */
  onMediaData?: (store: PeachifyProgressStore) => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  // container ref for fullscreen request so our custom button stays visible
  const containerRef = useRef<HTMLDivElement>(null)
  // UI visibility handling – hide the custom fullscreen button after inactivity
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reset hide timer on any user interaction (mouse move or touch)
  const resetHideTimer = () => {
    setShowControls(true)
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    hideTimeoutRef.current = setTimeout(() => {
      // Do not hide controls while in fullscreen; user might need the exit button
      if (!isFullscreen) setShowControls(false)
    }, 3000)
  }

  const buildUrl = () => {
    const base =
      type === 'movie'
        ? `${ORIGIN}/movie/${mediaId}`
        : `${ORIGIN}/tv/${mediaId}/${season}/${episode}`
    const params = new URLSearchParams()
    if (type === 'tv') {
      params.set('nextEpisode', 'true')
      params.set('autoplayNextEpisode', 'true')
      params.set('episodeSelector', 'true')
    }
    if (autoPlay === false) params.set('autoplay', 'false')
    const qs = params.toString()
    return qs ? `${base}?${qs}` : base
  }

  // Sync progress with the same store/protocol as Peachify. This is the
  // same MEDIA_DATA convention every other embed in this family uses
  // (Peachify, VidLink, CinemaOS) — the payload is the full progress
  // store keyed by media id, merged rather than overwritten.
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== ORIGIN) return
      if (event.data?.type !== 'MEDIA_DATA') return

      try {
        const merged = mergePeachifyProgress(
          event.data.data as PeachifyProgressStore,
        )
        onMediaData?.(merged)
      } catch {
        // Corrupt payload — ignore rather than risk clobbering storage.
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onMediaData])

  // Monitor fullscreen changes and page visibility to keep controls visible when needed
  useEffect(() => {
    const handleFsChange = () => {
      const fullscreen = !!document.fullscreenElement
      setIsFullscreen(fullscreen)
      if (fullscreen) setShowControls(true)
    }
    const handleVisibility = () => {
      if (!document.hidden) setShowControls(true)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  // Handle returning to the page after an ad redirect (e.g., via browser back)
  // The `pageshow` event fires when a page is loaded from the bfcache (back‑forward cache).
  // When `event.persisted` is true we reset UI state so the fullscreen button reappears.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setShowControls(true)
        setIsFullscreen(false)
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  // Choose container styling based on fullscreen state. When fullscreen we drop the
  // 16:9 padding trick and make the container fill the screen so the iframe stays
  // centered and covers the whole viewport.
  const containerClass = isFullscreen
    ? 'fixed inset-0 w-screen h-screen bg-black z-20 flex items-center justify-center'
    : 'relative w-full pt-[56.25%] overflow-hidden rounded-xl bg-black';

  return (
    <div
      ref={containerRef}
      className={containerClass}
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* Custom fullscreen button – only visible when showControls is true */}
      {(showControls || isFullscreen) && (
        <button
          type="button"
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen()
            } else if (containerRef.current && containerRef.current.requestFullscreen) {
              containerRef.current.requestFullscreen()
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
