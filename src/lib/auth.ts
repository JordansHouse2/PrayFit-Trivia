import { supabase } from '@/lib/supabase';

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super('Supabase is not configured — set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    this.name = 'SupabaseNotConfiguredError';
  }
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) throw new SupabaseNotConfiguredError();
  return supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) throw new SupabaseNotConfiguredError();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
