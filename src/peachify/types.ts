/** Peachify embed origin — validate postMessage sources against this. */
export const PEACHIFY_ORIGIN = 'https://peachify.top' as const;

export type PeachifyMediaType = 'movie' | 'tv';

export type MediaId = number | string;

/** Keys that accept hide/false/0/off to hide a control. */
export type PeachifyHideControlKey =
  | 'pip'
  | 'cast'
  | 'fullscreen'
  | 'volume'
  | 'servers'
  | 'captions'
  | 'quality'
  | 'play'
  | 'rewind'
  | 'forward'
  | 'timegroup'
  | 'timeslider'
  | 'settings';

export type HideControlValue = boolean | 'false' | '0' | 'off';

export interface PeachifyHideControls {
  pip?: HideControlValue;
  cast?: HideControlValue;
  fullscreen?: HideControlValue;
  volume?: HideControlValue;
  servers?: HideControlValue;
  captions?: HideControlValue;
  quality?: HideControlValue;
  play?: HideControlValue;
  rewind?: HideControlValue;
  forward?: HideControlValue;
  timegroup?: HideControlValue;
  timeslider?: HideControlValue;
  settings?: HideControlValue;
}

export interface PeachifyEmbedOptions extends PeachifyHideControls {
  /** Target audio language (alias: audio). */
  dub?: string;
  audio?: string;
  /** Target subtitle language or label (alias: subtitle). */
  sub?: string;
  subtitle?: string;
  /** Preferred quality, e.g. 1080 or 1080p (alias: q). */
  quality?: string | number;
  q?: string | number;
  /** Force a specific provider first. */
  server?: string;
  /** Override provider API base URL. */
  api?: string;
  /** Start playback at this time in seconds (aliases: progress, t). */
  startAt?: number;
  progress?: number;
  t?: number;
  /** TV only: auto-advance to next episode (boolean or seconds threshold). */
  autoNext?: boolean | number;
  /** TV only: show manual Next Episode button. */
  showNextBtn?: boolean;
  showAutoNextButton?: boolean;
  nextEpisodeButton?: boolean;
  /** UI accent color hex without #, e.g. B54666 */
  accent?: string;
  /** Default true; pass false to disable autoplay. */
  autoPlay?: boolean;
}

export interface PeachifyMovieTarget {
  type: 'movie';
  mediaId: MediaId;
  options?: PeachifyEmbedOptions;
}

export interface PeachifyTvTarget {
  type: 'tv';
  mediaId: MediaId;
  season: number;
  episode: number;
  options?: PeachifyEmbedOptions;
}

export type PeachifyEmbedTarget = PeachifyMovieTarget | PeachifyTvTarget;

/** Outbound postMessage commands. */
export type PeachifyCommand =
  | 'play'
  | 'pause'
  | 'seek'
  | 'start'
  | 'setVolume'
  | 'toggleMute'
  | 'toggleFullscreen'
  | 'getStatus';

export interface PeachifyOutboundMessage {
  command: PeachifyCommand;
  value?: number;
}

export type PeachifyPlayerEventName =
  | 'play'
  | 'pause'
  | 'seeked'
  | 'ended'
  | 'timeupdate'
  | string;

export interface PeachifyPlayerEventData {
  event: PeachifyPlayerEventName;
  currentTime: number;
  duration: number;
  tmdbId?: number;
  mediaType?: PeachifyMediaType;
  season?: number;
  episode?: number;
}

export interface PeachifyPlayerEventMessage {
  type: 'PLAYER_EVENT';
  data: PeachifyPlayerEventData;
}

export interface PeachifyMediaDataMessage {
  type: 'MEDIA_DATA';
  data: PeachifyProgressStore;
}

export type PeachifyInboundMessage =
  | PeachifyPlayerEventMessage
  | PeachifyMediaDataMessage;

export interface PeachifyWatchProgress {
  watched: number;
  duration: number;
}

export interface PeachifyEpisodeProgress {
  season: string;
  episode: string;
  progress: PeachifyWatchProgress;
}

export interface PeachifyMediaProgressEntry {
  id: number;
  type: PeachifyMediaType;
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  progress: PeachifyWatchProgress;
  last_season_watched?: string;
  last_episode_watched?: string;
  show_progress?: Record<string, PeachifyEpisodeProgress>;
  last_updated?: number;
}

/** Full continue-watching store keyed by media id string. */
export type PeachifyProgressStore = Record<string, PeachifyMediaProgressEntry>;

export interface PeachifyControllerOptions {
  /** Allowed postMessage origin. Default: https://peachify.top */
  origin?: string;
  /** Persist MEDIA_DATA payloads. Default: true */
  persistProgress?: boolean;
  /** localStorage key for progress. Default: peachifyProgress */
  storageKey?: string;
  /** Throttle timeupdate callbacks (ms). Default: 1000 */
  timeupdateThrottleMs?: number;
  /** Called when MEDIA_DATA arrives (after optional persist). */
  onMediaData?: (store: PeachifyProgressStore) => void;
  /** Called on every PLAYER_EVENT (timeupdate throttled). */
  onPlayerEvent?: (data: PeachifyPlayerEventData) => void;
}
