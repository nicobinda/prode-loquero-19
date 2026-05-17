import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { OnboardingForm } from './OnboardingForm';

export const metadata = { title: 'Configurá tu perfil — Prode Binda 2026' };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.nickname) redirect('/');

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-10">
      <header className="text-center">
        <p className="font-display text-sm font-bold uppercase tracking-[0.10em] text-pb-ceruleo">
          Último paso
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-pb-navy">
          Contanos quién sos
        </h1>
        <p className="mt-1 text-sm text-pb-muted">
          Tu apodo y foto te identifican en el ranking
        </p>
      </header>

      <OnboardingForm />
    </main>
  );
}
