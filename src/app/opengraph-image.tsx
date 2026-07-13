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
          background: '#121316',
          position: 'relative',
        }}
      >
        {/* Soft ambient glow, matching the Frosted Minimal hero treatment */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '25%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(127,184,217,0.18)',
            filter: 'blur(0px)',
          }}
        />
        {/* Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: 20,
              background: '#7FB8D9',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M5 4v16l11-8z" fill="#121316" />
            </svg>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 600,
                color: '#EDEDEF',
                fontFamily: 'system-ui, sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              Tiger
              <span style={{ color: '#7FB8D9' }}>Stream</span>
            </span>
          </div>
        </div>
        {/* Tagline */}
        <span
          style={{
            fontSize: 22,
            color: 'rgba(237,237,239,0.55)',
            fontFamily: 'system-ui, sans-serif',
            marginTop: 20,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            zIndex: 1,
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
