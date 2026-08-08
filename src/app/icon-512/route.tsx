import { ImageResponse } from 'next/og';

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
          background: '#121316',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 400,
            height: 400,
            borderRadius: 96,
            background: '#7FB8D9',
          }}
        >
          <svg width="200" height="200" viewBox="0 0 24 24" fill="none">
            <path d="M5 4v16l11-8z" fill="#121316" />
          </svg>
        </div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
