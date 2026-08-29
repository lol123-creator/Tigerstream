/* Safer PPV fetcher: defensive parsing, content-type checks, optional retry,
   and do NOT cache invalid/HTML responses. Drop this in place of your original file. */

import type { PpvCategory, PpvStream, PpvStreamsResponse } from '@/types/sports';

// Switched from api.ppv.is (down) to ppv.st. This whole family of PPV
// aggregator mirrors (ppv.st, ppv.land, ppv.wtf, old.ppv.to, etc.)
// shares an identical /api/streams response shape - confirmed via
// their public docs - so this is a domain swap only, no shape changes
// needed anywhere else in this file.
const PPV_API = 'https://ppv.st/api/streams';

/** ppv.to recommends polling about every minute */
const PPV_REVALIDATE = 60;

const EMPTY_RESPONSE: PpvStreamsResponse = {
  success: true,
  streams: [],
};

let cachedPayload: PpvStreamsResponse | null = null;
let cachedAt = 0;

// Small retry settings for transient network/server errors
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 250;

function isValidPpvResponse(obj: any): obj is PpvStreamsResponse {
  return obj && typeof obj === 'object' && typeof obj.success === 'boolean' && Array.isArray(obj.streams);
}

async function attemptFetchOnce(): Promise<{ ok: boolean; status: number; contentType: string | null; text: string }> {
  const res = await fetch(PPV_API, {
    headers: { Accept: 'application/json' },
    next: { revalidate: PPV_REVALIDATE },
    // keep default redirect behaviour (follow)
  });

  const contentType = res.headers.get('content-type');
  const text = await res.text();
  return { ok: res.ok, status: res.status, contentType, text };
}

async function fetchStreamsPayload(): Promise<PpvStreamsResponse> {
  const now = Date.now();
  if (cachedPayload && now - cachedAt < PPV_REVALIDATE * 1000) {
    return cachedPayload;
  }

  // Try up to MAX_RETRIES+1 times for transient errors
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { ok, status, contentType, text } = await attemptFetchOnce();

      // If not ok, log and decide whether to retry
      if (!ok) {
        console.warn(`PPV API returned non-2xx (status=${status}), attempt ${attempt + 1}/${MAX_RETRIES + 1}. Body preview:`, text.slice(0, 500));
        // Retry for 5xx statuses (server transient), otherwise break and return EMPTY
        if (status >= 500 && attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_BASE_MS * Math.pow(2, attempt)));
          continue;
        }
        return EMPTY_RESPONSE;
      }

      // If content-type doesn't look like JSON, it's likely HTML (redirect/login/error page)
      if (!contentType || !contentType.includes('application/json')) {
        // Some servers return JSON but omit content-type; still attempt JSON parse below.
        // But if it clearly looks like HTML (starts with "<"), bail out early.
        const trimmed = text.trimStart();
        if (trimmed.startsWith('<') || !contentType) {
          console.warn('PPV API returned non-JSON response - using empty response', { status, contentType, preview: text.slice(0, 500) });
          return EMPTY_RESPONSE;
        }
      }

      // Defensive JSON parse
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        // Some mirrors might return a top-level array instead of object; handle that if parse succeeded
        console.warn('PPV API JSON parse failed - using empty response:', err, 'body-preview:', text.slice(0, 500));
        // Do not cache; this may be transient malformed response. Retry on attempt if available.
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_BASE_MS * Math.pow(2, attempt)));
          continue;
        }
        return EMPTY_RESPONSE;
      }

      // Accept either the documented object shape or a top-level array (convert array to shape)
      let data: PpvStreamsResponse;
      if (Array.isArray(parsed)) {
        data = { success: true, streams: parsed as unknown as PpvCategory[] };
      } else {
        data = parsed as PpvStreamsResponse;
      }

      if (!isValidPpvResponse(data)) {
        console.warn('PPV API returned unexpected shape - using empty response', { preview: text.slice(0, 500) });
        return EMPTY_RESPONSE;
      }

      if (!data.success) {
        console.warn('PPV API returned success=false - using empty response');
        return EMPTY_RESPONSE;
      }

      // All good — cache and return
      cachedPayload = data;
      cachedAt = now;
      return data;
    } catch (err) {
      console.warn('PPV API fetch failed - using empty response:', err, `attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_BASE_MS * Math.pow(2, attempt)));
        continue;
      }
      return EMPTY_RESPONSE;
    }
  }

  return EMPTY_RESPONSE;
}

function flattenStreams(categories: PpvCategory[]): PpvStream[] {
  return categories.flatMap((c) =>
    c.streams.map((s) => ({
      ...s,
      category_name: s.category_name || c.category,
      category_id: c.id,
    })),
  );
}

export async function getPpvCategories(): Promise<PpvCategory[]> {
  const data = await fetchStreamsPayload();
  return data.streams.filter((c) => c.streams.length > 0);
}

export async function getAllPpvStreams(): Promise<PpvStream[]> {
  const categories = await getPpvCategories();
  return flattenStreams(categories);
}

export async function getPpvCategory(categoryId: number): Promise<PpvCategory | null> {
  const categories = await getPpvCategories();
  return categories.find((c) => c.id === categoryId) ?? null;
}

export async function getPpvStreamById(streamId: number): Promise<PpvStream | null> {
  const all = await getAllPpvStreams();
  return all.find((s) => s.id === streamId) ?? null;
}

const nowSec = () => Math.floor(Date.now() / 1000);

export function isStreamLive(stream: PpvStream): boolean {
  if (stream.always_live === 1) return true;
  const now = nowSec();
  if (stream.starts_at && stream.ends_at) {
    return now >= stream.starts_at && now <= stream.ends_at;
  }
  return false;
}

export function isStreamUpcoming(stream: PpvStream): boolean {
  if (stream.always_live === 1) return false;
  return stream.starts_at > nowSec();
}

export function formatStreamTime(stream: PpvStream): string {
  if (stream.always_live === 1) return 'Live 24/7';
  if (!stream.starts_at) return 'Scheduled';
  const start = new Date(stream.starts_at * 1000);
  if (isStreamLive(stream)) return `Live · started ${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  if (isStreamUpcoming(stream)) {
    return start.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  return 'Ended';
}

export function getEmbedUrl(stream: PpvStream, substreamUri?: string): string | null {
  if (substreamUri) {
    const sub = stream.substreams?.find((s) => s.uri_name === substreamUri);
    if (sub?.iframe) return sub.iframe;
  }
  return stream.iframe ?? null;
}

export async function getLiveStreams(limit = 24): Promise<PpvStream[]> {
  const all = await getAllPpvStreams();
  return all
    .filter((s) => isStreamLive(s) && s.iframe)
    .sort((a, b) => Number(b.viewers ?? 0) - Number(a.viewers ?? 0))
    .slice(0, limit);
}

export async function getFeaturedSport(): Promise<PpvStream | null> {
  const live = await getLiveStreams(1);
  if (live[0]) return live[0];
  const all = (await getAllPpvStreams()).filter((s) => s.iframe);
  return all[0] ?? null;
}

export async function getLiveStreamsSafe(limit = 24): Promise<PpvStream[]> {
  try {
    return await getLiveStreams(limit);
  } catch {
    return [];
  }
}

/** Live events first; otherwise next upcoming streams with a player URL */
export async function getHomeSportsRow(limit = 16): Promise<{
  title: string;
  streams: PpvStream[];
}> {
  const live = await getLiveStreamsSafe(limit);
  if (live.length > 0) {
    return { title: 'Live Sports', streams: live };
  }
  try {
    const upcoming = (await getAllPpvStreams())
      .filter((s) => s.iframe && isStreamUpcoming(s))
      .sort((a, b) => a.starts_at - b.starts_at)
      .slice(0, limit);
    return { title: 'Upcoming Sports', streams: upcoming };
  } catch {
    return { title: 'Sports', streams: [] };
  }
}
