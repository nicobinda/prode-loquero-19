'use server';

import { redirect } from 'next/navigation';
import { hashPin, isValidDni, normalizeDni, verifyPin } from '@/lib/auth/pin';
import { setSessionCookie, signSession } from '@/lib/auth/session';
import { supabaseAdmin } from '@/lib/supabase';
import {
  clearAttempts,
  isLocked,
  registerFailedAttempt,
} from '@/lib/auth/rate-limit';

export interface DniCheckResult {
  ok: boolean;
  needsPinSetup?: boolean;
  error?: string;
}

export async function checkDni(rawDni: string): Promise<DniCheckResult> {
  const dni = normalizeDni(rawDni);
  if (!isValidDni(dni)) {
    return { ok: false, error: 'Ingresá un DNI válido (7 u 8 dígitos)' };
  }

  const { data, error } = await supabaseAdmin()
    .from('users')
    .select('id, pin_hash')
    .eq('dni', dni)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: 'DNI no autorizado. Pedile a Nico que te agregue.' };
  }
  return { ok: true, needsPinSetup: !data.pin_hash };
}

export interface LoginResult {
  ok: boolean;
  error?: string;
  redirectTo?: string;
}

export async function login(rawDni: string, pin: string): Promise<LoginResult> {
  const dni = normalizeDni(rawDni);
  if (!isValidDni(dni) || !/^\d{4}$/.test(pin)) {
    return { ok: false, error: 'Datos inválidos' };
  }

  const sb = supabaseAdmin();
  const { data: user } = await sb
    .from('users')
    .select('id, pin_hash, nickname, is_admin')
    .eq('dni', dni)
    .maybeSingle();

  if (!user) return { ok: false, error: 'DNI no autorizado' };
  if (!user.pin_hash) {
    return { ok: false, error: 'Aún no definiste tu PIN' };
  }
  if (await isLocked(user.id)) {
    return {
      ok: false,
      error: 'Demasiados intentos. Probá en 15 minutos.',
    };
  }

  const valid = await verifyPin(pin, user.pin_hash);
  if (!valid) {
    await registerFailedAttempt(user.id);
    return { ok: false, error: 'PIN incorrecto' };
  }

  await clearAttempts(user.id);

  const token = await signSession({
    sub: user.id,
    dni,
    is_admin: user.is_admin,
  });
  await setSessionCookie(token);

  return {
    ok: true,
    redirectTo: user.nickname ? '/' : '/onboarding',
  };
}

export async function setupPinAndLogin(
  rawDni: string,
  pin: string,
): Promise<LoginResult> {
  const dni = normalizeDni(rawDni);
  if (!isValidDni(dni) || !/^\d{4}$/.test(pin)) {
    return { ok: false, error: 'Datos inválidos' };
  }

  const sb = supabaseAdmin();
  const { data: user } = await sb
    .from('users')
    .select('id, pin_hash, is_admin')
    .eq('dni', dni)
    .maybeSingle();

  if (!user) return { ok: false, error: 'DNI no autorizado' };
  if (user.pin_hash) {
    return { ok: false, error: 'El PIN ya está definido' };
  }

  const pin_hash = await hashPin(pin);
  const { error: updErr } = await sb
    .from('users')
    .update({ pin_hash, first_login_at: new Date().toISOString() })
    .eq('id', user.id);

  if (updErr) return { ok: false, error: 'No se pudo guardar el PIN' };

  const token = await signSession({
    sub: user.id,
    dni,
    is_admin: user.is_admin,
  });
  await setSessionCookie(token);

  return { ok: true, redirectTo: '/onboarding' };
}

export async function logout() {
  const { clearSessionCookie } = await import('@/lib/auth/session');
  await clearSessionCookie();
  redirect('/login');
}
