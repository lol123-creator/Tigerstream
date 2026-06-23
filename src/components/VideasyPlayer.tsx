'use client'

import { useEffect, useRef } from 'react'

/**
 * VideasyPlayer embeds a Videasy player inside an iframe.
 * Known embed pattern:
 *   Movie: https://player.videasy.net/embed/{mediaId}
 *   TV:    https://player.videasy.net/embed/{mediaId}?season={season}&episode={episode}
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

  const buildUrl = () => {
    const base = `https://player.videasy.net/embed/${mediaId}`
    const params = new URLSearchParams()
    if (autoPlay) params.set('autoplay', '1')
    if (type === 'tv' && season != null && episode != null) {
      params.set('season', String(season))
      params.set('episode', String(episode))
    }
    const qs = params.toString()
    return qs ? `${base}?${qs}` : base
  }

  // Sync progress with the same localStorage key as Peachify
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== 'https://player.videasy.net') return
      if (event.data?.type === 'MEDIA_DATA') {
        try {
          localStorage.setItem('peachifyProgress', JSON.stringify(event.data.data))
        } catch { }
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <div className="relative w-full pt-[56.25%] overflow-hidden rounded-xl bg-black">
      <iframe
        ref={iframeRef}
        src={buildUrl()}
        title={title || 'Video player'}
        className="absolute top-0 left-0 w-full h-full border-0"
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        referrerPolicy="origin"
      />
    </div>
  )
}
