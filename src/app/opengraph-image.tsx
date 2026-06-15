import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0c 0%, #1a1a20 50%, #0a0a0c 100%)',
          position: 'relative',
        }}
      >
        {/* Accent bar at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: '#f59e0b',
          }}
        />
        {/* Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M5 4v16l11-8z"
              fill="#f59e0b"
            />
          </svg>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'system-ui, sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              Tiger
              <span style={{ color: '#f59e0b' }}>Stream</span>
            </span>
          </div>
        </div>
        {/* Tagline */}
        <span
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'system-ui, sans-serif',
            marginTop: 16,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Stream movies & TV shows for free
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}