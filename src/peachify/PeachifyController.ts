import { PEACHIFY_ORIGIN } from './types';
import { mergePeachifyProgress } from './progressStorage';
import type {
  PeachifyControllerOptions,
  PeachifyInboundMessage,
  PeachifyOutboundMessage,
} from './types';

/**
 * Wires up postMessage listening/sending for a single Peachify iframe.
 * One instance per <PeachifyPlayer>.
 */
export class PeachifyController {
  private iframe: HTMLIFrameElement | null = null;
  private origin: string;
  private storageKey?: string;
  private persistProgress: boolean;
  private onPlayerEvent?: PeachifyControllerOptions['onPlayerEvent'];
  private onMediaData?: PeachifyControllerOptions['onMediaData'];
  private handleMessage = (event: MessageEvent<PeachifyInboundMessage>) => {
    if (event.origin !== this.origin) return;
    if (this.iframe && event.source !== this.iframe.contentWindow) return;

    const data = event.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'PLAYER_EVENT') {
      this.onPlayerEvent?.(data.data);
      return;
    }

    if (data.type === 'MEDIA_DATA') {
      const store = data.data;
      if (this.persistProgress) {
        mergePeachifyProgress(store, this.storageKey);
        // Fire-and-forget cloud push - only does anything if signed in.
        import('@/lib/cloud-sync').then((m) => m.pushProgressSnapshot()).catch(() => {});
      }
      this.onMediaData?.(store);
      return;
    }
  };

  constructor(options: PeachifyControllerOptions = {}) {
    this.origin = options.origin ?? PEACHIFY_ORIGIN;
    this.storageKey = options.storageKey;
    this.persistProgress = options.persistProgress ?? true;
    this.onPlayerEvent = options.onPlayerEvent;
    this.onMediaData = options.onMediaData;
  }

  attach(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
    window.addEventListener('message', this.handleMessage);
  }

  detach() {
    window.removeEventListener('message', this.handleMessage);
    this.iframe = null;
  }

  send(command: PeachifyOutboundMessage) {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage(command, this.origin);
  }
}
