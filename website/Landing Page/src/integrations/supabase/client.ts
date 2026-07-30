// Supabase client integration for CocoAI
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    // New Supabase API keys are opaque strings, not bearer JWTs.
    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function getEnvVar(key: string): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[key]) return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) return process.env[key];
  }
  return undefined;
}

function createSupabaseClient() {
  const SUPABASE_URL =
    getEnvVar('VITE_SUPABASE_URL') ||
    getEnvVar('SUPABASE_URL') ||
    'https://csntdpytzqcwceikdfyz.supabase.co';

  const SUPABASE_KEY =
    getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') ||
    getEnvVar('VITE_SUPABASE_ANON_KEY') ||
    getEnvVar('SUPABASE_PUBLISHABLE_KEY') ||
    'sb_publishable_IQB_lVpfzIqUe92_jqz1yA_rSQYnwNi';

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('[Supabase] Missing environment variables. Using fallback mode.');
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_KEY),
    },
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
