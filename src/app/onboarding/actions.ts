'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/getCurrentUser';
import { supabaseAdmin } from '@/lib/supabase';

export interface OnboardResult {
  ok: boolean;
  error?: string;
}

export async function checkNickname(nick: string): Promise<{ available: boolean }> {
  const user = await requireUser();
  const normalized = nick.trim();
  if (normalized.length < 2 || normalized.length > 20) return { available: false };

  const { data } = await supabaseAdmin()
    .from('users')
    .select('id')
    .ilike('nickname', normalized)
    .neq('id', user.id)
    .maybeSingle();

  return { available: !data };
}

export async function saveOnboarding(formData: FormData): Promise<OnboardResult> {
  const user = await requireUser();
  const nickname = String(formData.get('nickname') ?? '').trim();
  const file = formData.get('avatar') as File | null;

  if (nickname.length < 2 || nickname.length > 20) {
    return { ok: false, error: 'Apodo entre 2 y 20 caracteres' };
  }

  const sb = supabaseAdmin();

  // Verifica unicidad del apodo
  const { data: existing } = await sb
    .from('users')
    .select('id')
    .ilike('nickname', nickname)
    .neq('id', user.id)
    .maybeSingle();
  if (existing) return { ok: false, error: 'Ese apodo ya está usado' };

  let avatar_url: string | null = user.avatar_url;

  if (file && file.size > 0) {
    if (file.size > 2_000_000) {
      return { ok: false, error: 'La foto debe pesar menos de 2 MB' };
    }
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
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
  return { ok: true };
}
