'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PinInput } from '@/components/PinInput';
import { PBButton } from '@/components/PBButton';
import { checkDni, login, setupPinAndLogin } from './actions';

type Step = 'dni' | 'pin' | 'set-pin' | 'confirm-pin';

export function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>('dni');
  const [dni, setDni] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submitDni() {
    setError(null);
    startTransition(async () => {
      const res = await checkDni(dni);
      if (!res.ok) {
        setError(res.error ?? 'Error');
        return;
      }
      setStep(res.needsPinSetup ? 'set-pin' : 'pin');
    });
  }

  // Auto-submit cuando completa los 4 dígitos en el step 'pin'
  useEffect(() => {
    if (step !== 'pin' || pin.length !== 4) return;
    setError(null);
    startTransition(async () => {
      const res = await login(dni, pin);
      if (!res.ok) {
        setError(res.error ?? 'Error');
        setTimeout(() => setPin(''), 800);
        return;
      }
      router.push(res.redirectTo ?? '/');
    });
  }, [pin, step, dni, router]);

  // Después de "set-pin" pasar a "confirm-pin"
  useEffect(() => {
    if (step !== 'set-pin' || pin.length !== 4) return;
    setStep('confirm-pin');
  }, [step, pin]);

  // Confirmar PIN
  useEffect(() => {
    if (step !== 'confirm-pin' || confirmPin.length !== 4) return;
    if (confirmPin !== pin) {
      setError('Los PIN no coinciden. Empezá de nuevo.');
      setTimeout(() => {
        setPin('');
        setConfirmPin('');
        setError(null);
        setStep('set-pin');
      }, 1500);
      return;
    }
    startTransition(async () => {
      const res = await setupPinAndLogin(dni, pin);
      if (!res.ok) {
        setError(res.error ?? 'Error');
        return;
      }
      router.push(res.redirectTo ?? '/onboarding');
    });
  }, [confirmPin, step, pin, dni, router]);

  function backToDni() {
    setStep('dni');
    setPin('');
    setConfirmPin('');
    setError(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="font-display text-sm font-bold uppercase tracking-[0.10em] text-pb-ceruleo">
          {step === 'dni'
            ? '¡Hola, loquero!'
            : step === 'pin'
              ? 'Te conocemos…'
              : step === 'set-pin'
                ? 'Bienvenido al Prode'
                : 'Una más para confirmar'}
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold leading-tight">
          {step === 'dni' && 'Ingresá tu DNI para entrar al Prode'}
          {step === 'pin' && 'Ahora poné tu PIN de 4 dígitos'}
          {step === 'set-pin' && 'Definí un PIN de 4 dígitos'}
          {step === 'confirm-pin' && 'Repetí el PIN para confirmar'}
        </h1>
      </header>

      {step === 'dni' && (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-display text-sm font-semibold text-white/80">
              DNI
            </span>
            <input
              autoFocus
              value={dni}
              onChange={(e) => {
                setDni(e.target.value.replace(/\D/g, '').slice(0, 8));
                setError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && dni && submitDni()}
              placeholder="30.123.456"
              inputMode="numeric"
              className={
                'w-full rounded-2xl bg-white/10 px-4 py-3 text-lg text-white placeholder:text-white/40 ' +
                'border transition focus:outline-none focus:ring-4 ' +
                (error
                  ? 'border-pb-red focus:ring-pb-red/20'
                  : 'border-white/20 focus:border-pb-ceruleo focus:ring-pb-ceruleo/20')
              }
            />
            {error && <span className="text-sm text-pb-red">{error}</span>}
          </label>

          <PBButton
            variant="cta"
            onClick={submitDni}
            disabled={!dni || pending}
          >
            {pending ? 'Verificando…' : 'Continuar'}
          </PBButton>
        </div>
      )}

      {(step === 'pin' || step === 'set-pin' || step === 'confirm-pin') && (
        <div className="flex flex-col gap-4">
          <PinInput
            value={step === 'confirm-pin' ? confirmPin : pin}
            onChange={step === 'confirm-pin' ? setConfirmPin : setPin}
            error={error}
            autoFocus
          />
          <button
            type="button"
            onClick={backToDni}
            className="self-center font-display text-sm font-bold text-white/65 hover:text-white"
          >
            ← Cambiar DNI
          </button>
        </div>
      )}
    </div>
  );
}
