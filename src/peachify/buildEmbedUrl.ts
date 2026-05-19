import {
  PEACHIFY_ORIGIN,
  type HideControlValue,
  type MediaId,
  type PeachifyEmbedOptions,
  type PeachifyEmbedTarget,
  type PeachifyHideControlKey,
  type PeachifyProgressStore,
} from './types';

const HIDE_CONTROL_KEYS: PeachifyHideControlKey[] = [
  'pip',
  'cast',
  'fullscreen',
  'volume',
  'servers',
  'captions',
  'quality',
  'play',
  'rewind',
  'forward',
  'timegroup',
  'timeslider',
  'settings',
];

function encodeMediaId(mediaId: MediaId): string {
  const raw = String(mediaId).trim();
  if (/^tt\d+$/i.test(raw)) {
    return raw.toLowerCase();
  }
  const numeric = Number(raw);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error(
      `Invalid mediaId "${mediaId}". Use a TMDB numeric id or an IMDb id starting with "tt".`,
    );
  }
  return String(Math.trunc(numeric));
}

function appendHideParams(
  params: URLSearchParams,
  options: PeachifyEmbedOptions,
): void {
  for (const key of HIDE_CONTROL_KEYS) {
    const value = options[key];
    if (value === undefined) continue;
    params.set(key, hideValueToQuery(value));
  }
}

function hideValueToQuery(value: HideControlValue): string {
  if (value === true) return 'hide';
  if (value === false) return 'false';
  return String(value);
}

function setIfDefined(
  params: URLSearchParams,
  key: string,
  value: string | number | boolean | undefined,
): void {
  if (value === undefined) return;
  if (typeof value === 'boolean') {
    params.set(key, value ? 'true' : 'false');
    return;
  }
  params.set(key, String(value));
}

/**
 * Build a Peachify embed URL with path and query parameters.
 */
export function buildPeachifyEmbedUrl(
  target: PeachifyEmbedTarget,
  baseOrigin: string = PEACHIFY_ORIGIN,
): string {
  const mediaId = encodeMediaId(target.mediaId);
  const options = target.options ?? {};

  let path: string;
  if (target.type === 'movie') {
    path = `/embed/movie/${mediaId}`;
  } else {
    const season = Math.max(1, Math.trunc(target.season));
    const episode = Math.max(1, Math.trunc(target.episode));
    path = `/embed/tv/${mediaId}/${season}/${episode}`;
  }

  const url = new URL(path, baseOrigin);
  const params = url.searchParams;

  const dub = options.dub ?? options.audio;
  const sub = options.sub ?? options.subtitle;
  const quality = options.quality ?? options.q;
  const startAt = options.startAt ?? options.progress ?? options.t;

  setIfDefined(params, 'dub', dub);
  setIfDefined(params, 'sub', sub);
  setIfDefined(params, 'quality', quality);
  setIfDefined(params, 'server', options.server);
  setIfDefined(params, 'api', options.api);
  setIfDefined(params, 'startAt', startAt);

  if (target.type === 'tv') {
    if (options.autoNext !== undefined) {
      setIfDefined(params, 'autoNext', options.autoNext);
    }
    const showNext =
      options.showNextBtn ??
      options.showAutoNextButton ??
      options.nextEpisodeButton;
    if (showNext !== undefined) {
      setIfDefined(params, 'showNextBtn', showNext);
    }
  }

  if (options.accent) {
    params.set('accent', options.accent.replace(/^#/, ''));
  }

  if (options.autoPlay === false) {
    params.set('autoPlay', 'false');
  }

  appendHideParams(params, options);

  return url.toString();
}

/**
 * Read resume position (seconds) for a movie or TV episode from a progress store.
 */
export function getResumeSeconds(
  store: PeachifyProgressStore | null | undefined,
  mediaId: MediaId,
  season?: number,
  episode?: number,
  /** Skip resume if within this many seconds of the end. Default: 30 */
  endThresholdSeconds = 30,
): number | undefined {
  if (!store) return undefined;

  const entry = store[String(mediaId)];
  if (!entry) return undefined;

  let watched: number | undefined;
  let duration: number | undefined;

  if (season != null && episode != null && entry.show_progress) {
    const key = `s${season}e${episode}`;
    const ep = entry.show_progress[key];
    watched = ep?.progress?.watched;
    duration = ep?.progress?.duration;
  } else {
    watched = entry.progress?.watched;
    duration = entry.progress?.duration;
  }

  if (watched == null || !Number.isFinite(watched) || watched <= 0) {
    return undefined;
  }

  if (
    duration != null &&
    Number.isFinite(duration) &&
    duration - watched <= endThresholdSeconds
  ) {
    return undefined;
  }

  return Math.floor(watched);
}
