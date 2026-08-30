'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  AVATAR_PRESETS,
  avatarPreset,
  createProfile,
  deleteProfile,
  fetchProfiles,
  getCachedProfiles,
  renameProfile,
  restyleProfile,
  setActiveProfileId,
  type Profile,
} from '@/lib/profiles';

const SESSION_KEY = 'tigerstream:profile-selected';
const LITE_KEY = 'tigerstream:lite-mode';

type Status = 'checking' | 'hidden' | 'showing';

/**
 * A Netflix/Apple TV-style profile picker shown once per browser
 * session, after the intro. Signed-in accounts get real, multiple
 * profiles here (add / rename / change avatar / delete) - continue
 * watching and favorites are scoped to whichever one is active.
 * Guest browsing keeps its original single "Guest" bucket, kept on
 * this device only, same as before profiles existed at all.
 */
export function ProfileGate() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('checking');
  const [uid, setUid] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [leaving, setLeaving] = useState(false);
  const [editing, setEditing] = useState<Profile | 'new' | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const alreadyChosen = sessionStorage.getItem(SESSION_KEY);
    let liteMode = false;
    try {
      liteMode = localStorage.getItem(LITE_KEY) === '1';
    } catch {
      // storage unavailable
    }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const userId = data.user?.id ?? null;
      setUid(userId);

      if (alreadyChosen) {
        setStatus('hidden');
        return;
      }
      // Lite Mode devices skip the picker entirely - one less screen,
      // one less thing for a weak device to render.
      if (liteMode) {
        sessionStorage.setItem(SESSION_KEY, '1');
        setStatus('hidden');
        return;
      }

      if (userId) {
        const cached = getCachedProfiles();
        if (cached.length) setProfiles(cached);
        const fresh = await fetchProfiles(userId);
        setProfiles(fresh);
      }
      setStatus('showing');
    });
  }, []);

  const chooseProfile = (id: string) => {
    setActiveProfileId(id);
    dismiss();
  };

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // storage unavailable - the gate just won't remember for next time
      }
      setStatus('hidden');
    }, 250);
  };

  if (status !== 'showing') return null;

  if (editing) {
    return (
      <ProfileEditor
        uid={uid}
        profile={editing === 'new' ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={(updated) => {
          setProfiles((prev) => {
            const exists = prev.some((p) => p.id === updated.id);
            return exists ? prev.map((p) => (p.id === updated.id ? updated : p)) : [...prev, updated];
          });
          setEditing(null);
        }}
        onDeleted={(id) => {
          setProfiles((prev) => prev.filter((p) => p.id !== id));
          setEditing(null);
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-surface px-4 transition-opacity duration-250"
      style={{ opacity: leaving ? 0 : 1 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-ambient-glow" />

      <h1 className="font-display relative text-2xl font-medium text-white sm:text-3xl">
        Who&apos;s watching?
      </h1>

      <div className="relative mt-10 flex flex-wrap items-start justify-center gap-6 sm:gap-8">
        {uid &&
          profiles.map((p) => {
            const preset = avatarPreset(p.avatar);
            return (
              <div key={p.id} className="group relative flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => chooseProfile(p.id)}
                  className="flex h-24 w-24 items-center justify-center rounded-2xl text-3xl ring-2 ring-transparent transition group-hover:ring-white/40 sm:h-28 sm:w-28"
                  style={{ backgroundColor: `${preset.color}33` }}
                >
                  {preset.emoji}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  aria-label={`Edit ${p.name}`}
                  className="absolute -right-1 -top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white/70 hover:text-white group-hover:flex"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
                <span className="max-w-[7rem] truncate text-sm font-medium text-ink-1 group-hover:text-white">
                  {p.name}
                </span>
              </div>
            );
          })}

        {uid && profiles.length < 5 && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="group flex flex-col items-center gap-3"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-glass-border text-ink-3 transition group-hover:border-accent/40 group-hover:text-accent sm:h-28 sm:w-28">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="text-sm font-medium text-ink-2 group-hover:text-white">Add Profile</span>
          </button>
        )}

        {!uid && (
          <button type="button" onClick={dismiss} className="group flex flex-col items-center gap-3">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/[0.06] text-ink-2 ring-2 ring-transparent transition group-hover:bg-white/[0.1] group-hover:text-white group-hover:ring-white/30 sm:h-28 sm:w-28">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" strokeDasharray="3 2" />
              </svg>
            </div>
            <span className="text-sm font-medium text-ink-2 group-hover:text-white">Guest</span>
          </button>
        )}

        {!uid && (
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.setItem(SESSION_KEY, '1');
              } catch {}
              router.push('/auth');
            }}
            className="group flex flex-col items-center gap-3"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-glass-border text-ink-3 transition group-hover:border-accent/40 group-hover:text-accent sm:h-28 sm:w-28">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 17l5-5-5-5M15 12H3" />
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-ink-2 group-hover:text-white">Sign In</span>
          </button>
        )}
      </div>

      {!uid && (
        <p className="relative mt-10 max-w-xs text-center text-xs text-ink-4">
          Guest browsing keeps your list and progress on this device only.
          Sign in to create profiles and sync across devices.
        </p>
      )}
    </div>
  );
}

function ProfileEditor({
  uid,
  profile,
  onCancel,
  onSaved,
  onDeleted,
}: {
  uid: string | null;
  profile: Profile | null;
  onCancel: () => void;
  onSaved: (p: Profile) => void;
  onDeleted: (id: string) => void;
}) {
  const [name, setName] = useState(profile?.name ?? '');
  const [avatar, setAvatar] = useState(profile?.avatar ?? AVATAR_PRESETS[0].key);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!uid || !name.trim()) return;
    setSaving(true);
    if (profile) {
      await Promise.all([
        name !== profile.name ? renameProfile(profile.id, name.trim()) : Promise.resolve(true),
        avatar !== profile.avatar ? restyleProfile(profile.id, avatar) : Promise.resolve(true),
      ]);
      onSaved({ ...profile, name: name.trim(), avatar });
    } else {
      const created = await createProfile(uid, name.trim(), avatar);
      if (created) onSaved(created);
    }
    setSaving(false);
  };

  const remove = async () => {
    if (!profile) return;
    setSaving(true);
    const ok = await deleteProfile(profile.id);
    setSaving(false);
    if (ok) onDeleted(profile.id);
  };

  return (
    <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-surface px-4">
      <div className="pointer-events-none absolute inset-0 bg-ambient-glow" />
      <div className="relative w-full max-w-sm">
        <h2 className="font-display text-center text-2xl font-medium text-white">
          {profile ? 'Edit Profile' : 'Add Profile'}
        </h2>

        <div className="mt-8 flex justify-center">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-2xl text-4xl"
            style={{ backgroundColor: `${avatarPreset(avatar).color}33` }}
          >
            {avatarPreset(avatar).emoji}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {AVATAR_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => setAvatar(preset.key)}
              aria-label={preset.key}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition ${
                avatar === preset.key ? 'ring-2 ring-accent' : 'ring-1 ring-white/10 hover:ring-white/30'
              }`}
              style={{ backgroundColor: `${preset.color}33` }}
            >
              {preset.emoji}
            </button>
          ))}
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          maxLength={20}
          className="mt-6 w-full rounded-xl border border-glass-border bg-white/5 px-4 py-2.5 text-center text-sm text-white outline-none ring-accent/50 transition focus:border-accent/50 focus:ring-2"
        />

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-glass-border px-4 py-2.5 text-sm font-medium text-ink-2 transition hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !name.trim()}
            onClick={save}
            className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-[#0A1F2B] transition hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {profile && !profile.isDefault && (
          <button
            type="button"
            disabled={saving}
            onClick={remove}
            className="mt-4 w-full text-center text-xs text-red-400 hover:text-red-300"
          >
            Delete profile
          </button>
        )}
      </div>
    </div>
  );
}
