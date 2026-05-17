import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// Cliente browser (anon key). No setea sesión — la auth es custom.
let _browser: SupabaseClient | null = null;
export function supabaseBrowser(): SupabaseClient {
  if (_browser) return _browser;
  _browser = createClient(env.supabase.url, env.supabase.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _browser;
}

// Cliente server con un JWT del usuario logueado (para que RLS aplique).
// El JWT lo emitimos nosotros con `jose` y contiene `sub = user.id`.
export function supabaseServer(userJwt?: string): SupabaseClient {
  return createClient(env.supabase.url, env.supabase.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: userJwt
      ? { headers: { Authorization: `Bearer ${userJwt}` } }
      : undefined,
  });
}

// Cliente admin (service role). SOLO server-side. Bypassea RLS.
export function supabaseAdmin(): SupabaseClient {
  if (!env.supabase.serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurado');
  }
  return createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
