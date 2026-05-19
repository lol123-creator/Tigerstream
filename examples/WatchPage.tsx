/**
 * Example Next.js / React watch page.
 * Copy PeachifyPlayer + src/peachify into your app.
 */
import { useRef } from 'react';
import {
  PeachifyPlayer,
  type PeachifyPlayerHandle,
} from '../src/components/PeachifyPlayer';
import { getMediaProgress, loadPeachifyProgress } from '../src/peachify';

export function WatchPage() {
  const playerRef = useRef<PeachifyPlayerHandle>(null);

  return (
    <main>
      <PeachifyPlayer
        ref={playerRef}
        target={{
          type: 'tv',
          mediaId: 76479,
          season: 1,
          episode: 1,
          options: {
            dub: 'English',
            sub: 'English',
            quality: '1080p',
            server: 'iron',
            accent: 'B54666',
            autoNext: 45,
            showNextBtn: true,
            cast: false,
          },
        }}
        autoResume
        onPlayerEvent={(e) => {
          if (e.event === 'ended') {
            // e.g. navigate to next episode route
          }
        }}
        onMediaData={() => {
          const store = loadPeachifyProgress();
          const entry = getMediaProgress(store, 76479);
          console.log('Continue watching', entry?.progress);
        }}
      />

      <button type="button" onClick={() => playerRef.current?.play()}>
        Play
      </button>
      <button type="button" onClick={() => playerRef.current?.pause()}>
        Pause
      </button>
    </main>
  );
}
