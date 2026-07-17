import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #9DCCE8 0%, #7FB8D9 35%, #3D6E8C 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -60,
            left: -40,
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.22)',
          }}
        />
        <svg width="260" height="260" viewBox="0 0 96 96" fill="none">
          <path
            d="M14 22 H82 L82 40 H58 V80 H38 V40 H14 Z"
            fill="#0A1F2B"
          />
          <path d="M44 22 L52 30 L44 38 Z" fill="#7FB8D9" />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
          }}
        />
      </div>
    ),
    { width: 512, height: 512 },
  );
}
