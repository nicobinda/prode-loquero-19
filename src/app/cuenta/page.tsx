import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { AppHeader } from '@/components/AppHeader';
import { logout } from '../login/actions';
import { AccountForm } from './AccountForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mi cuenta — Prode Binda 2026' };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.nickname) redirect('/onboarding');

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pb-12">
      <AppHeader nickname={user.nickname} />
      <h1 className="font-display text-xl font-black text-pb-navy">Mi cuenta</h1>

      <AccountForm
        initialNickname={user.nickname}
        initialAvatarUrl={user.avatar_url}
        dni={user.dni}
      />

      <section className="rounded-3xl bg-white p-5 shadow-[0_4px_12px_rgba(11,29,94,0.06)]">
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-pb-muted">
          Seguridad
        </h2>
        <p className="text-sm text-pb-deep-blue">
          El PIN no se puede cambiar desde acá. Si lo olvidaste, pedile a un
          admin que lo blanquee.
        </p>
      </section>

      <form action={logout}>
        <button
          type="submit"
          className="w-full rounded-2xl border-2 border-pb-red-dark py-3 font-display text-sm font-bold text-pb-red-dark hover:bg-pb-red/5"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
