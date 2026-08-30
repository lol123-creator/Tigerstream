import { recordFromMediaData } from '@/lib/watch-progress';
import {
  PEACHIFY_ORIGIN,
  type PeachifyCommand,
  type PeachifyControllerOptions,
  type PeachifyInboundMessage,
  type PeachifyOutboundMessage,
  type PeachifyPlayerEventData,
  type PeachifyProgressStore,
} from './types';

function isPeachifyInboundMessage(data: unknown): data is PeachifyInboundMessage {
  if (!data || typeof data !== 'object') return false;
  const type = (data as { type?: unknown }).type;
  return type === 'PLAYER_EVENT' || type === 'MEDIA_DATA';
}

/**
 * postMessage bridge for a Peachify iframe: playback control + progress sync.
 */
export class PeachifyController {
  private iframe: HTMLIFrameElement | null = null;
  private boundListener: ((event: MessageEvent) => void) | null = null;
  private destroyed = false;
  private lastTimeupdateAt = 0;

  readonly origin: string;
  readonly persistProgress: boolean;
  readonly timeupdateThrottleMs: number;
  readonly onMediaData?: (store: PeachifyProgressStore) => void;
  readonly onPlayerEvent?: (data: PeachifyPlayerEventData) => void;

  constructor(options: PeachifyControllerOptions = {}) {
    this.origin = options.origin ?? PEACHIFY_ORIGIN;
    this.persistProgress = options.persistProgress !== false;
    this.timeupdateThrottleMs = options.timeupdateThrottleMs ?? 1000;
    this.onMediaData = options.onMediaData;
    this.onPlayerEvent = options.onPlayerEvent;
  }

  /** Attach to an iframe and start listening for player messages. */
  attach(iframe: HTMLIFrameElement): void {
    this.detach();
    this.iframe = iframe;
    this.destroyed = false;

    this.boundListener = (event: MessageEvent) => this.handleMessage(event);
    window.addEventListener('message', this.boundListener);
  }

  detach(): void {
    if (this.boundListener) {
      window.removeEventListener('message', this.boundListener);
      this.boundListener = null;
    }
    this.iframe = null;
  }

  destroy(): void {
    this.destroyed = true;
    this.detach();
  }

  private handleMessage(event: MessageEvent): void {
    if (this.destroyed) return;
    if (event.origin !== this.origin) return;
    if (this.iframe && event.source !== this.iframe.contentWindow) return;
    if (!isPeachifyInboundMessage(event.data)) return;

    if (event.data.type === 'MEDIA_DATA') {
      const store = event.data.data;
      if (this.persistProgress && typeof window !== 'undefined') {
        // recordFromMediaData does the local merge (composite movie/tv
        // keys, dedup) AND the cloud push, in one place shared by all
        // three players - nothing else needed here.
        recordFromMediaData(store);
      }
      this.onMediaData?.(store);
      return;
    }

    const payload = event.data.data;
    if (payload.event === 'timeupdate') {
      const now = Date.now();
      if (now - this.lastTimeupdateAt < this.timeupdateThrottleMs) {
        return;
      }
      this.lastTimeupdateAt = now;
    }

    this.onPlayerEvent?.(payload);
  }

  /** Send a command to the embedded player. */
  post(command: PeachifyCommand, value?: number): void {
    const win = this.iframe?.contentWindow;
    if (!win) {
      console.warn('[PeachifyController] No iframe attached');
      return;
    }
    const message: PeachifyOutboundMessage = { command };
    if (value !== undefined) {
      message.value = value;
    }
    win.postMessage(message, this.origin);
  }

  play(): void {
    this.post('play');
  }

  pause(): void {
    this.post('pause');
  }

  seek(seconds: number): void {
    this.post('seek', seconds);
  }

  setVolume(level: number): void {
    this.post('setVolume', Math.min(1, Math.max(0, level)));
  }

  toggleMute(): void {
    this.post('toggleMute');
  }

  toggleFullscreen(): void {
    this.post('toggleFullscreen');
  }

  getStatus(): void {
    this.post('getStatus');
  }
}
