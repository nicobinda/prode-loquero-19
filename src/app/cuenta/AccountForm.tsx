'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PBButton } from '@/components/PBButton';
import { PBInput } from '@/components/PBInput';
import { Avatar } from '@/components/Avatar';
import { updateProfile } from './actions';

interface Props {
  initialNickname: string;
  initialAvatarUrl: string | null;
  dni: string;
}

export function AccountForm({ initialNickname, initialAvatarUrl, dni }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [nickname, setNickname] = useState(initialNickname);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dirty =
    nickname.trim() !== initialNickname || file !== null;

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
      setError('Apodo de al menos 2 caracteres');
      return;
    }
    const fd = new FormData();
    fd.set('nickname', nickname.trim());
    if (file) fd.set('avatar', file);

    startTransition(async () => {
      const res = await updateProfile(fd);
      if (!res.ok) {
        setError(res.error ?? 'Error');
        return;
      }
      setSuccess(true);
      setFile(null);
      router.refresh();
      setTimeout(() => setSuccess(false), 1500);
    });
  }

  return (
    <section className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-[0_4px_12px_rgba(11,29,94,0.06)]">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative"
          aria-label="Cambiar foto"
        >
          <Avatar src={previewUrl} nickname={nickname || '?'} size={88} />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-pb-navy px-2 py-0.5 font-display text-[10px] font-bold text-white shadow-md">
            Cambiar
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPickFile}
          className="hidden"
        />
        <div className="flex flex-col gap-0.5 text-sm">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-pb-muted">
            DNI
          </span>
          <span className="font-display font-bold text-pb-deep-blue">{dni}</span>
        </div>
      </div>

      <PBInput
        label="Apodo"
        value={nickname}
        onChange={(v) => {
          setNickname(v.slice(0, 20));
          setError(null);
        }}
        maxLength={20}
      />

      {error && (
        <p className="rounded-xl bg-pb-red/10 px-4 py-3 text-sm font-semibold text-pb-red-dark">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl bg-pb-green/15 px-4 py-3 text-sm font-bold text-pb-navy">
          ✓ Guardado
        </p>
      )}

      <PBButton onClick={submit} disabled={!dirty || pending}>
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </PBButton>
    </section>
  );
}
