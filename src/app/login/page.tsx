import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { LoginForm } from './LoginForm';

export const metadata = {
  title: 'Ingresar — Prode Loquero 19',
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.nickname ? '/' : '/onboarding');

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden text-white" style={{ background: '#1A0A3E' }}>
      {/* Gradient overlay violeta oscuro */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(150,90,255,0.30) 0%, rgba(30,10,75,0) 60%), linear-gradient(180deg, #2A1063 0%, #0F0426 100%)',
        }}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-7 pb-8 pt-12">
        <div className="flex justify-center pt-8">
          <Image
            src="/logo-prode-binda.png"
            alt="Prode Loquero 19"
            width={200}
            height={200}
            priority
            className="drop-shadow-[0_8px_24px_rgba(150,90,255,0.45)]"
          />
        </div>

        <div className="mt-auto">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
