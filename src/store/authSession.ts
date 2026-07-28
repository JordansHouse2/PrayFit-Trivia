import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface AuthSessionState {
  session: Session | null;
  /** True once we've checked for an existing session (or determined there's no backend to check). */
  initialized: boolean;
  init: () => void;
}

let listenerRegistered = false;

export const useAuthSession = create<AuthSessionState>((set) => ({
  session: null,
  initialized: false,

  init: () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ initialized: true });
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, initialized: true });
    });

    if (!listenerRegistered) {
      listenerRegistered = true;
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session });
      });
    }
  },
}));
