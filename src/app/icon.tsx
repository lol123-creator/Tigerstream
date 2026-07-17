import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 8,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 96 96" fill="none">
          <path
            d="M14 22 H82 L82 40 H58 V80 H38 V40 H14 Z"
            fill="#0A1F2B"
          />
          <path d="M44 22 L52 30 L44 38 Z" fill="#7FB8D9" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
