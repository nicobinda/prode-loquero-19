import { cache } from 'react';
import { readSessionCookie, verifySession } from './session';
import { supabaseAdmin } from '@/lib/supabase';
import type { User } from '@/types/db';

// Cached per-request: evita N queries por render.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await readSessionCookie();
  if (!token) return null;

  const claims = await verifySession(token);
  if (!claims?.sub) return null;

  const { data, error } = await supabaseAdmin()
    .from('users')
    .select('*')
    .eq('id', claims.sub)
    .single();

  if (error || !data) return null;
  return data as User;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (!user.is_admin) throw new Error('FORBIDDEN');
  return user;
}
