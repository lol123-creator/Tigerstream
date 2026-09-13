'use client';

import { useState } from 'react';
import { setPin, verifyPin } from '@/lib/pin-client';

interface PinModalProps {
  mode: 'verify' | 'create' | 'change';
  onSuccess: () => void;
  onCancel: () => void;
}

export function PinModal({ mode, onSuccess, onCancel }: PinModalProps) {
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>(
    mode === 'change' ? 'current' : mode === 'create' ? 'new' : 'current',
  );
  const [currentPin, setCurrentPin] = useState('');
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inputValue = step === 'current' ? currentPin : step === 'new' ? pin : confirmPin;
  const setInputValue = step === 'current' ? setCurrentPin : step === 'new' ? setPinValue : setConfirmPin;

  const handleDigits = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setInputValue(digits);
    setError(null);
  };

  const submit = async () => {
    setError(null);

    if (mode === 'verify' || (mode === 'change' && step === 'current')) {
      if (currentPin.length < 4) return;
      setBusy(true);
      const ok = await verifyPin(currentPin);
      setBusy(false);
      if (!ok) {
        setError('Incorrect PIN');
        setCurrentPin('');
        return;
      }
      if (mode === 'verify') {
        onSuccess();
        return;
      }
      setStep('new');
      return;
    }

    if (step === 'new') {
      if (pin.length < 4) return;
      setStep('confirm');
      return;
    }

    if (step === 'confirm') {
      if (confirmPin !== pin) {
        setError("PINs don't match");
        setConfirmPin('');
        return;
      }
      setBusy(true);
      const result = await setPin(pin, mode === 'change' ? currentPin : undefined);
      setBusy(false);
      if (!result.ok) {
        setError(result.error ?? 'Could not set PIN.');
        return;
      }
      onSuccess();
    }
  };

  const heading =
    mode === 'verify'
      ? 'Enter PIN'
      : step === 'current'
        ? 'Enter your current PIN'
        : step === 'new'
          ? 'Choose a new PIN'
          : 'Confirm your new PIN';

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xs rounded-2xl border border-glass-border bg-surface p-6 shadow-2xl">
        <h2 className="text-center text-lg font-semibold text-white">{heading}</h2>
        {mode !== 'verify' && (
          <p className="mt-1 text-center text-xs text-ink-3">
            {step === 'new' && 'This PIN will be required to edit profiles or leave a Kids Profile.'}
          </p>
        )}

        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={inputValue}
          onChange={(e) => handleDigits(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          maxLength={6}
          placeholder="••••"
          className="mt-5 w-full rounded-xl border border-glass-border bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white outline-none ring-accent/50 transition focus:border-accent/50 focus:ring-2"
        />

        {error && <p className="mt-3 text-center text-xs text-red-300">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-glass-border px-4 py-2.5 text-sm font-medium text-ink-2 transition hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || inputValue.length < 4}
            onClick={submit}
            className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-[#0A1F2B] transition hover:bg-accent-hover disabled:opacity-50"
          >
            {busy ? 'Checking...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
