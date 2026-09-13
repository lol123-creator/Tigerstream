'use client';

export async function getPinStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/pin/status');
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.hasPin;
  } catch {
    return false;
  }
}

export async function verifyPin(pin: string): Promise<boolean> {
  try {
    const res = await fetch('/api/pin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.ok;
  } catch {
    return false;
  }
}

export async function setPin(pin: string, currentPin?: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/pin/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, currentPin }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? 'Could not set PIN.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not reach the server.' };
  }
}
