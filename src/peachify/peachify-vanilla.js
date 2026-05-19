/**
 * Vanilla JS Peachify embed helper (no build step).
 * Copy into your site or load as a module: import from peachify/index.ts in bundled apps.
 */
(function (global) {
  const PEACHIFY_ORIGIN = 'https://peachify.top';
  const DEFAULT_STORAGE_KEY = 'peachifyProgress';

  const HIDE_KEYS = [
    'pip', 'cast', 'fullscreen', 'volume', 'servers', 'captions', 'quality',
    'play', 'rewind', 'forward', 'timegroup', 'timeslider', 'settings',
  ];

  function encodeMediaId(mediaId) {
    const raw = String(mediaId).trim();
    if (/^tt\d+$/i.test(raw)) return raw.toLowerCase();
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      throw new Error('mediaId must be TMDB numeric or IMDb tt-prefixed id');
    }
    return String(Math.trunc(n));
  }

  function hideValue(v) {
    if (v === true) return 'hide';
    if (v === false) return 'false';
    return String(v);
  }

  function buildPeachifyEmbedUrl(target) {
    const id = encodeMediaId(target.mediaId);
    const o = target.options || {};
    const path =
      target.type === 'movie'
        ? `/embed/movie/${id}`
        : `/embed/tv/${id}/${Math.max(1, target.season | 0)}/${Math.max(1, target.episode | 0)}`;

    const url = new URL(path, PEACHIFY_ORIGIN);
    const p = url.searchParams;

    if (o.dub || o.audio) p.set('dub', o.dub || o.audio);
    if (o.sub || o.subtitle) p.set('sub', o.sub || o.subtitle);
    if (o.quality != null || o.q != null) p.set('quality', String(o.quality ?? o.q));
    if (o.server) p.set('server', o.server);
    if (o.api) p.set('api', o.api);

    const start = o.startAt ?? o.progress ?? o.t;
    if (start != null) p.set('startAt', String(start));

    if (target.type === 'tv') {
      if (o.autoNext != null) p.set('autoNext', String(o.autoNext));
      const next = o.showNextBtn ?? o.showAutoNextButton ?? o.nextEpisodeButton;
      if (next != null) p.set('showNextBtn', next ? 'true' : 'false');
    }

    if (o.accent) p.set('accent', String(o.accent).replace(/^#/, ''));
    if (o.autoPlay === false) p.set('autoPlay', 'false');

    for (const k of HIDE_KEYS) {
      if (o[k] !== undefined) p.set(k, hideValue(o[k]));
    }

    return url.toString();
  }

  function loadProgress(key) {
    key = key || DEFAULT_STORAGE_KEY;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function mergeProgress(incoming, key) {
    key = key || DEFAULT_STORAGE_KEY;
    const merged = { ...loadProgress(key), ...incoming };
    localStorage.setItem(key, JSON.stringify(merged));
    return merged;
  }

  function getResumeSeconds(store, mediaId, season, episode, threshold) {
    threshold = threshold ?? 30;
    const entry = store && store[String(mediaId)];
    if (!entry) return undefined;

    let watched, duration;
    if (season != null && episode != null && entry.show_progress) {
      const ep = entry.show_progress[`s${season}e${episode}`];
      watched = ep && ep.progress && ep.progress.watched;
      duration = ep && ep.progress && ep.progress.duration;
    } else {
      watched = entry.progress && entry.progress.watched;
      duration = entry.progress && entry.progress.duration;
    }

    if (watched == null || watched <= 0) return undefined;
    if (duration != null && duration - watched <= threshold) return undefined;
    return Math.floor(watched);
  }

  function PeachifyController(options) {
    options = options || {};
    this.origin = options.origin || PEACHIFY_ORIGIN;
    this.storageKey = options.storageKey || DEFAULT_STORAGE_KEY;
    this.persistProgress = options.persistProgress !== false;
    this.timeupdateThrottleMs = options.timeupdateThrottleMs ?? 1000;
    this.onMediaData = options.onMediaData;
    this.onPlayerEvent = options.onPlayerEvent;
    this._iframe = null;
    this._lastTU = 0;
    this._onMessage = this._onMessage.bind(this);
  }

  PeachifyController.prototype.attach = function (iframe) {
    this.detach();
    this._iframe = iframe;
    window.addEventListener('message', this._onMessage);
  };

  PeachifyController.prototype.detach = function () {
    window.removeEventListener('message', this._onMessage);
    this._iframe = null;
  };

  PeachifyController.prototype.destroy = function () {
    this.detach();
  };

  PeachifyController.prototype._onMessage = function (event) {
    if (event.origin !== this.origin) return;
    if (this._iframe && event.source !== this._iframe.contentWindow) return;

    const data = event.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'MEDIA_DATA') {
      if (this.persistProgress) mergeProgress(data.data, this.storageKey);
      if (this.onMediaData) this.onMediaData(data.data);
      return;
    }

    if (data.type === 'PLAYER_EVENT' && data.data) {
      if (data.data.event === 'timeupdate') {
        const now = Date.now();
        if (now - this._lastTU < this.timeupdateThrottleMs) return;
        this._lastTU = now;
      }
      if (this.onPlayerEvent) this.onPlayerEvent(data.data);
    }
  };

  PeachifyController.prototype.post = function (command, value) {
    if (!this._iframe || !this._iframe.contentWindow) return;
    const msg = { command: command };
    if (value !== undefined) msg.value = value;
    this._iframe.contentWindow.postMessage(msg, this.origin);
  };

  PeachifyController.prototype.play = function () { this.post('play'); };
  PeachifyController.prototype.pause = function () { this.post('pause'); };
  PeachifyController.prototype.seek = function (s) { this.post('seek', s); };
  PeachifyController.prototype.setVolume = function (v) {
    this.post('setVolume', Math.min(1, Math.max(0, v)));
  };
  PeachifyController.prototype.toggleMute = function () { this.post('toggleMute'); };
  PeachifyController.prototype.toggleFullscreen = function () { this.post('toggleFullscreen'); };
  PeachifyController.prototype.getStatus = function () { this.post('getStatus'); };

  /**
   * Mount player into a container element.
   * @returns {{ iframe: HTMLIFrameElement, controller: PeachifyController, url: string }}
   */
  function mountPeachifyPlayer(container, target, options) {
    options = options || {};
    const autoResume = options.autoResume !== false;
    const embedOptions = Object.assign({}, target.options || {});

    if (
      autoResume &&
      embedOptions.startAt == null &&
      embedOptions.progress == null &&
      embedOptions.t == null
    ) {
      const store = loadProgress(options.storageKey);
      const resume =
        target.type === 'tv'
          ? getResumeSeconds(store, target.mediaId, target.season, target.episode)
          : getResumeSeconds(store, target.mediaId);
      if (resume != null) embedOptions.startAt = resume;
    }

    const url = buildPeachifyEmbedUrl(Object.assign({}, target, { options: embedOptions }));

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.title = options.title || 'Video player';
    iframe.allow = options.allow || 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'origin';
    iframe.style.cssText =
      'width:100%;aspect-ratio:16/9;border:0;display:block;background:#000';

    container.innerHTML = '';
    container.appendChild(iframe);

    const controller = new PeachifyController(options.controllerOptions);
    controller.attach(iframe);

    return { iframe: iframe, controller: controller, url: url };
  }

  const api = {
    PEACHIFY_ORIGIN: PEACHIFY_ORIGIN,
    buildPeachifyEmbedUrl: buildPeachifyEmbedUrl,
    loadPeachifyProgress: loadProgress,
    mergePeachifyProgress: mergeProgress,
    getResumeSeconds: getResumeSeconds,
    PeachifyController: PeachifyController,
    mountPeachifyPlayer: mountPeachifyPlayer,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.Peachify = api;
})(typeof window !== 'undefined' ? window : globalThis);
