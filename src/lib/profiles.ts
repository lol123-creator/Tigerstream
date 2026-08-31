'use client';

/**
 * Netflix-style profiles for a signed-in account: multiple named
 * profiles (with a preset avatar) that continue-watching and
 * favorites are scoped to once a profile is active. Guest browsing
 * (no account) never touches this - it stays the single local bucket
 * it always was.
 */

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  isDefault?: boolean;
  /** Content filtering (see @/lib/kid-mode) applies whenever this
   *  profile is active. */
  isKid?: boolean;
}

export const AVATAR_PRESETS: { key: string; emoji: string; color: string }[] = [
  { key: 'red', emoji: '🎬', color: '#E5484D' },
  { key: 'orange', emoji: '🍿', color: '#F76B15' },
  { key: 'yellow', emoji: '⭐', color: '#F5A623' },
  { key: 'green', emoji: '🎮', color: '#30A46C' },
  { key: 'teal', emoji: '🌊', color: '#12A594' },
  { key: 'blue', emoji: '🚀', color: '#0091FF' },
  { key: 'indigo', emoji: '🎧', color: '#3E63DD' },
  { key: 'purple', emoji: '🔮', color: '#8E4EC6' },
  { key: 'pink', emoji: '🦄', color: '#D6409F' },
  { key: 'gray', emoji: '👾', color: '#6B7280' },
];

export function avatarPreset(key: string) {
  return AVATAR_PRESETS.find((a) => a.key === key) ?? AVATAR_PRESETS[0];
}

const ACTIVE_KEY = 'tigerstream:active-profile';
const CLOUD_CACHE_KEY = 'tigerstream:profiles-cache';
/** Matches KID_MODE_COOKIE in @/lib/kid-mode - kept as a plain string
 *  here rather than importing that (server-only, uses next/headers)
 *  into this client module. */
const KID_MODE_COOKIE = 'tigerstream-kid-mode';

export function getActiveProfileId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function setActiveProfileId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    // storage unavailable - the picker just won't remember for next time
  }
}

/**
 * Sets (or clears) the kid-mode cookie that @/lib/kid-mode reads
 * server-side to decide what content to filter. A plain cookie, not
 * httpOnly, since it only ever needs to be set from client components
 * (ProfileGate) and read from Server Components/route handlers - never
 * from anything that needs it hidden from the browser itself.
 */
export function setKidModeCookie(isKid: boolean) {
  if (typeof document === 'undefined') return;
  if (isKid) {
    document.cookie = `${KID_MODE_COOKIE}=1; path=/; max-age=31536000; SameSite=Lax`;
  } else {
    document.cookie = `${KID_MODE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

/**
 * Turns a base storage key ("peachifyProgress", "tigerstream:favorites")
 * into a profile-scoped one when signed in ("peachifyProgress:<id>"),
 * or leaves it untouched for guest browsing. One shared helper so
 * watch-progress, favorites, and cloud-sync can never drift on the key
 * format.
 */
export function scopedStorageKey(base: string, signedIn: boolean): string {
  if (!signedIn) return base;
  const id = getActiveProfileId();
  return id ? `${base}:${id}` : base;
}

export function getCachedProfiles(): Profile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CLOUD_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCachedProfiles(list: Profile[]) {
  try {
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(list));
  } catch {
    // best-effort cache only
  }
}

/**
 * Fetches this account's profiles from Supabase. The first time an
 * account is ever seen here, it has zero rows in `profiles` - this
 * auto-creates one default "Me" profile so there's always at least
 * one to select (the SQL migration already pointed any pre-existing
 * watch history/favorites at that same default profile server-side).
 */
export async function fetchProfiles(uid: string): Promise<Profile[]> {
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: true });

  let list: Profile[] = (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    avatar: r.avatar,
    isDefault: r.is_default,
    isKid: r.is_kid ?? false,
  }));

  if (list.length === 0) {
    const created = await createProfile(uid, 'Me', AVATAR_PRESETS[0].key, true);
    if (created) list = [created];
  }

  setCachedProfiles(list);
  const active = getActiveProfileId();
  if (!active || !list.some((p) => p.id === active)) {
    setActiveProfileId(list[0]?.id ?? '');
    setKidModeCookie(!!list[0]?.isKid);
  }
  return list;
}

export async function createProfile(
  uid: string,
  name: string,
  avatar: string,
  isDefault = false,
  isKid = false,
): Promise<Profile | null> {
  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .insert({ user_id: uid, name, avatar, is_default: isDefault, is_kid: isKid })
      .select()
      .single();
    if (error || !data) return null;
    const profile: Profile = {
      id: data.id,
      name: data.name,
      avatar: data.avatar,
      isDefault: data.is_default,
      isKid: data.is_kid ?? false,
    };
    setCachedProfiles([...getCachedProfiles(), profile]);
    return profile;
  } catch {
    return null;
  }
}

async function updateProfile(
  id: string,
  patch: { name?: string; avatar?: string; isKid?: boolean },
): Promise<boolean> {
  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.avatar !== undefined) dbPatch.avatar = patch.avatar;
    if (patch.isKid !== undefined) dbPatch.is_kid = patch.isKid;
    const { error } = await supabase.from('profiles').update(dbPatch).eq('id', id);
    if (error) return false;
    setCachedProfiles(getCachedProfiles().map((p) => (p.id === id ? { ...p, ...patch } : p)));
    // If this is the currently-active profile, the cookie needs to
    // reflect the change immediately.
    if (patch.isKid !== undefined && getActiveProfileId() === id) {
      setKidModeCookie(patch.isKid);
    }
    return true;
  } catch {
    return false;
  }
}

export function renameProfile(id: string, name: string): Promise<boolean> {
  return updateProfile(id, { name });
}

export function restyleProfile(id: string, avatar: string): Promise<boolean> {
  return updateProfile(id, { avatar });
}

export function setProfileKidMode(id: string, isKid: boolean): Promise<boolean> {
  return updateProfile(id, { isKid });
}

export async function deleteProfile(id: string): Promise<boolean> {
  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) return false;
    setCachedProfiles(getCachedProfiles().filter((p) => p.id !== id));
    if (getActiveProfileId() === id) {
      const remaining = getCachedProfiles();
      setActiveProfileId(remaining[0]?.id ?? '');
      setKidModeCookie(!!remaining[0]?.isKid);
    }
    return true;
  } catch {
    return false;
  }
}
