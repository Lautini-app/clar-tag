type EnvRecord = Record<string, string | undefined>;

const PUBLIC_URL_KEYS = ["VITE_SUPABASE_URL", "SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"] as const;

const PUBLIC_KEY_KEYS = [
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_ANON_KEY",
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const ADMIN_KEY_KEYS = ["CLAR_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"] as const;

function getProcessEnv(): EnvRecord {
  if (typeof process === "undefined" || !process.env) return {};
  return process.env as EnvRecord;
}

function firstDefined(keys: readonly string[], ...sources: EnvRecord[]): string | undefined {
  for (const key of keys) {
    for (const source of sources) {
      const value = source[key];
      if (value) return value;
    }
  }
  return undefined;
}

function bundledPublicEnv(): EnvRecord {
  return {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
}

function publicEnvSources(): EnvRecord[] {
  return [bundledPublicEnv(), import.meta.env as EnvRecord, getProcessEnv()];
}

export function readSupabasePublicEnv() {
  const sources = publicEnvSources();
  const url = firstDefined(PUBLIC_URL_KEYS, ...sources);
  const publishableKey = firstDefined(PUBLIC_KEY_KEYS, ...sources);

  return {
    url,
    publishableKey,
    missing: [
      ...(!url ? ["VITE_SUPABASE_URL or SUPABASE_URL"] : []),
      ...(!publishableKey ? ["VITE_SUPABASE_PUBLISHABLE_KEY or SUPABASE_PUBLISHABLE_KEY"] : []),
    ],
  };
}

export function readSupabaseAdminEnv() {
  const processEnv = getProcessEnv();
  const url = firstDefined(PUBLIC_URL_KEYS, processEnv);
  const serviceRoleKey = firstDefined(ADMIN_KEY_KEYS, processEnv);

  return {
    url,
    serviceRoleKey,
    missing: [
      ...(!url ? ["SUPABASE_URL"] : []),
      ...(!serviceRoleKey ? ["CLAR_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE_KEY"] : []),
    ],
  };
}
