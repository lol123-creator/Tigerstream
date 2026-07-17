import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
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
        {/* Soft glossy highlight top-left, like most polished app icons */}
        <div
          style={{
            position: 'absolute',
            top: -30,
            left: -20,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            filter: 'blur(0px)',
          }}
        />
        {/* T monogram - the crossbar's center notch doubles as a subtle
            play-mark nod without falling back to a generic triangle */}
        <svg width="96" height="96" viewBox="0 0 96 96" fill="none" style={{ position: 'relative' }}>
          <path
            d="M14 22 H82 L82 40 H58 V80 H38 V40 H14 Z"
            fill="#0A1F2B"
          />
          <path d="M44 22 L52 30 L44 38 Z" fill="#7FB8D9" />
        </svg>
        {/* Thin inner border ring for a crisp, premium edge */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 0,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
