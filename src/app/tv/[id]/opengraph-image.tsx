import { ImageResponse } from 'next/og';
import { getTvShowById } from '@/lib/tmdb/service';
import { tmdbImage } from '@/lib/tmdb-images';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const show = await getTvShowById(Number(id));

  if (!show) {
    return new ImageResponse(<div style={{ width: '100%', height: '100%', background: '#121316' }} />, size);
  }

  const backdrop = show.backdrop_path ? tmdbImage(show.backdrop_path, 'w780') : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: '#121316',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {backdrop && (
          <img
            src={backdrop}
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              inset: 0,
              objectFit: 'cover',
              filter: 'saturate(1.3) brightness(0.55)',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, #121316 0%, rgba(18,19,22,0.75) 35%, rgba(18,19,22,0.25) 65%, rgba(18,19,22,0.4) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '56px 64px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 9,
                background: '#7FB8D9',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M5 4v16l11-8z" fill="#121316" />
              </svg>
            </div>
            <span style={{ fontSize: 22, fontWeight: 600, color: 'rgba(237,237,239,0.7)', letterSpacing: '0.03em' }}>
              Tiger<span style={{ color: '#7FB8D9' }}>Stream</span>
            </span>
          </div>
          <span
            style={{
              fontSize: 58,
              fontWeight: 700,
              color: '#EDEDEF',
              letterSpacing: '-0.02em',
              maxWidth: 1000,
              lineHeight: 1.1,
            }}
          >
            {show.title}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20, fontSize: 24 }}>
            {show.vote_average > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', color: '#7FB8D9', fontWeight: 600 }}>
                ★ {show.vote_average.toFixed(1)}
              </span>
            )}
            {show.first_air_date && (
              <span style={{ color: 'rgba(237,237,239,0.55)' }}>
                {show.first_air_date.slice(0, 4)}
              </span>
            )}
            {show.genres?.[0] && (
              <span style={{ color: 'rgba(237,237,239,0.55)' }}>{show.genres[0]}</span>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
