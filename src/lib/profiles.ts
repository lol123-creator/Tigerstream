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
  }));

  if (list.length === 0) {
    const created = await createProfile(uid, 'Me', AVATAR_PRESETS[0].key, true);
    if (created) list = [created];
  }

  setCachedProfiles(list);
  const active = getActiveProfileId();
  if (!active || !list.some((p) => p.id === active)) {
    setActiveProfileId(list[0]?.id ?? '');
  }
  return list;
}

export async function createProfile(
  uid: string,
  name: string,
  avatar: string,
  isDefault = false,
): Promise<Profile | null> {
  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .insert({ user_id: uid, name, avatar, is_default: isDefault })
      .select()
      .single();
    if (error || !data) return null;
    const profile: Profile = { id: data.id, name: data.name, avatar: data.avatar, isDefault: data.is_default };
    setCachedProfiles([...getCachedProfiles(), profile]);
    return profile;
  } catch {
    return null;
  }
}

async function updateProfile(id: string, patch: { name?: string; avatar?: string }): Promise<boolean> {
  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update(patch).eq('id', id);
    if (error) return false;
    setCachedProfiles(getCachedProfiles().map((p) => (p.id === id ? { ...p, ...patch } : p)));
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
    }
    return true;
  } catch {
    return false;
  }
}
