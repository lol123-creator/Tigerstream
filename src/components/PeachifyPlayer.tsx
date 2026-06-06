'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  buildPeachifyEmbedUrl,
  getResumeSeconds,
  loadPeachifyProgress,
  PeachifyController,
  type PeachifyControllerOptions,
  type PeachifyEmbedTarget,
  type PeachifyPlayerEventData,
  type PeachifyProgressStore,
} from '@/peachify';

export interface PeachifyPlayerHandle {
  controller: PeachifyController;
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  getStatus: () => void;
}

export interface PeachifyPlayerProps {
  target: PeachifyEmbedTarget;
  autoResume?: boolean;
  controllerOptions?: Omit<
    PeachifyControllerOptions,
    'onMediaData' | 'onPlayerEvent'
  >;
  onMediaData?: (store: PeachifyProgressStore) => void;
  onPlayerEvent?: (data: PeachifyPlayerEventData) => void;
  className?: string;
  title?: string;
  allow?: string;
  onIframeLoad?: () => void;
}

const DEFAULT_ALLOW =
  'autoplay; fullscreen; picture-in-picture; encrypted-media';

export const PeachifyPlayer = forwardRef<
  PeachifyPlayerHandle,
  PeachifyPlayerProps
>(function PeachifyPlayer(
  {
    target,
    autoResume = true,
    controllerOptions,
    onMediaData,
    onPlayerEvent,
    className,
    title = 'Video player',
    allow = DEFAULT_ALLOW,
    onIframeLoad,
  },
  ref,
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controllerRef = useRef<PeachifyController | null>(null);
  const reactId = useId();
  const iframeId = `peachify-player-${reactId.replace(/:/g, '')}`;

  const embedUrl = useMemo(() => {
    const options = { ...target.options, autoplay: 1 };

    if (
      autoResume &&
      options.startAt == null &&
      options.progress == null &&
      options.t == null &&
      typeof window !== 'undefined'
    ) {
      const store = loadPeachifyProgress(controllerOptions?.storageKey);
      const resume =
        target.type === 'tv'
          ? getResumeSeconds(
              store,
              target.mediaId,
              target.season,
              target.episode,
            )
          : getResumeSeconds(store, target.mediaId);

      if (resume != null) {
        options.startAt = resume;
      }
    }

    return buildPeachifyEmbedUrl({ ...target, options });
  }, [target, autoResume, controllerOptions?.storageKey]);

  const getController = useCallback(() => {
    if (!controllerRef.current) {
      controllerRef.current = new PeachifyController({
        ...controllerOptions,
        onMediaData,
        onPlayerEvent,
      });
    }
    return controllerRef.current;
  }, [controllerOptions, onMediaData, onPlayerEvent]);

  useImperativeHandle(
    ref,
    () => {
      const controller = getController();
      return {
        controller,
        play: () => controller.play(),
        pause: () => controller.pause(),
        seek: (s) => controller.seek(s),
        setVolume: (v) => controller.setVolume(v),
        toggleMute: () => controller.toggleMute(),
        toggleFullscreen: () => controller.toggleFullscreen(),
        getStatus: () => controller.getStatus(),
      };
    },
    [getController],
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const controller = getController();
    controller.attach(iframe);

    return () => {
      controller.detach();
    };
  }, [embedUrl, getController]);

  useEffect(() => {
    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  return (
    <div className={className} data-peachify-player>
      <iframe
        ref={iframeRef}
        id={iframeId}
        src={embedUrl}
        title={title}
        allow={allow}
        allowFullScreen
        referrerPolicy="origin"
        className="aspect-video w-full border-0 bg-black"
        onLoad={onIframeLoad}
      />
    </div>
  );
});
