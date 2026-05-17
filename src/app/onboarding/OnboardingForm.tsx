'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PBButton } from '@/components/PBButton';
import { PBInput } from '@/components/PBInput';
import { Avatar } from '@/components/Avatar';
import { saveOnboarding } from './actions';

export function OnboardingForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [nickname, setNickname] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Foto debe ser JPG, PNG o WEBP');
      return;
    }
    if (f.size > 2_000_000) {
      setError('Foto debe pesar menos de 2 MB');
      return;
    }
    setError(null);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function submit() {
    if (nickname.trim().length < 2) {
      setError('Ingresá un apodo de al menos 2 caracteres');
      return;
    }
    const fd = new FormData();
    fd.set('nickname', nickname.trim());
    if (file) fd.set('avatar', file);

    startTransition(async () => {
      const res = await saveOnboarding(fd);
      if (!res.ok) {
        setError(res.error ?? 'Error al guardar');
        return;
      }
      router.push('/');
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative"
          aria-label="Cambiar foto"
        >
          <div className="overflow-hidden rounded-full ring-4 ring-pb-very-light-blue transition group-hover:ring-pb-ceruleo/30">
            <Avatar
              src={previewUrl}
              nickname={nickname || '?'}
              size={120}
            />
          </div>
          <span className="absolute inset-x-0 -bottom-1 flex justify-center">
            <span className="rounded-full bg-pb-navy px-3 py-1 font-display text-xs font-bold text-white shadow-md">
              {previewUrl ? 'Cambiar' : 'Subir foto'}
            </span>
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPickFile}
          className="hidden"
        />
      </div>

      <PBInput
        label="Apodo"
        value={nickname}
        onChange={(v) => {
          setNickname(v.slice(0, 20));
          setError(null);
        }}
        placeholder="Tincho"
        maxLength={20}
        autoFocus
      />

      {error && (
        <p className="rounded-xl bg-pb-red/10 px-4 py-3 text-sm font-semibold text-pb-red-dark">
          {error}
        </p>
      )}

      <PBButton onClick={submit} disabled={pending || !nickname.trim()}>
        {pending ? 'Guardando…' : 'Empezar a jugar'}
      </PBButton>
    </div>
  );
}
