'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/getCurrentUser';
import { supabaseAdmin } from '@/lib/supabase';

export interface UpdateResult {
  ok: boolean;
  error?: string;
  avatarUrl?: string;
}

export async function updateProfile(formData: FormData): Promise<UpdateResult> {
  const user = await requireUser();
  const nickname = String(formData.get('nickname') ?? '').trim();
  const file = formData.get('avatar') as File | null;

  if (nickname.length < 2 || nickname.length > 20) {
    return { ok: false, error: 'Apodo entre 2 y 20 caracteres' };
  }

  const sb = supabaseAdmin();

  if (nickname.toLowerCase() !== (user.nickname ?? '').toLowerCase()) {
    const { data: existing } = await sb
      .from('users')
      .select('id')
      .ilike('nickname', nickname)
      .neq('id', user.id)
      .maybeSingle();
    if (existing) return { ok: false, error: 'Ese apodo ya está usado' };
  }

  let avatar_url = user.avatar_url;
  if (file && file.size > 0) {
    if (file.size > 2_000_000) {
      return { ok: false, error: 'La foto debe pesar menos de 2 MB' };
    }
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `avatars/${user.id}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await sb.storage
      .from('avatars')
      .upload(path, buffer, { contentType: file.type, upsert: true });
    if (upErr) return { ok: false, error: 'No se pudo subir la foto' };

    const { data: publicUrl } = sb.storage.from('avatars').getPublicUrl(path);
    avatar_url = `${publicUrl.publicUrl}?v=${Date.now()}`;
  }

  const { error: updErr } = await sb
    .from('users')
    .update({ nickname, avatar_url })
    .eq('id', user.id);

  if (updErr) return { ok: false, error: 'No se pudo guardar' };

  revalidatePath('/');
  revalidatePath('/cuenta');
  return { ok: true, avatarUrl: avatar_url ?? undefined };
}
