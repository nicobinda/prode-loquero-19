// Centraliza la lectura de env vars. Falla rápido si falta algo crítico.

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export const env = {
  supabase: {
    url: required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    // Server-only:
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  footballData: {
    // football-data.org — su free tier incluye Mundial.
    token: process.env.FOOTBALL_DATA_TOKEN,
    competition: process.env.FOOTBALL_DATA_COMPETITION ?? 'WC',
  },
  session: {
    secret: process.env.SESSION_SECRET,
    cookieName: process.env.SESSION_COOKIE_NAME ?? 'pb_session',
    maxAgeDays: Number(process.env.SESSION_MAX_AGE_DAYS ?? 30),
  },
  bootstrapAdminDni: process.env.BOOTSTRAP_ADMIN_DNI,
};

export function assertServerEnv() {
  required('SUPABASE_SERVICE_ROLE_KEY', env.supabase.serviceRoleKey);
  required('FOOTBALL_DATA_TOKEN', env.footballData.token);
  required('SESSION_SECRET', env.session.secret);
}
