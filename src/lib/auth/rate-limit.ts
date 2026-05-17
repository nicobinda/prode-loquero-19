// Rate-limit simple para login. Usa la tabla `users` (failed_attempts, locked_until).
// Después de 5 intentos fallidos, bloquea 15 minutos.

import { supabaseAdmin } from '@/lib/supabase';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function isLocked(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin()
    .from('users')
    .select('locked_until')
    .eq('id', userId)
    .single();
  if (!data?.locked_until) return false;
  return new Date(data.locked_until).getTime() > Date.now();
}

export async function registerFailedAttempt(userId: string): Promise<void> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('users')
    .select('failed_attempts')
    .eq('id', userId)
    .single();

  const attempts = (data?.failed_attempts ?? 0) + 1;
  const update: Record<string, unknown> = { failed_attempts: attempts };
  if (attempts >= MAX_ATTEMPTS) {
    update.locked_until = new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString();
    update.failed_attempts = 0;
  }
  await sb.from('users').update(update).eq('id', userId);
}

export async function clearAttempts(userId: string): Promise<void> {
  await supabaseAdmin()
    .from('users')
    .update({ failed_attempts: 0, locked_until: null })
    .eq('id', userId);
}
