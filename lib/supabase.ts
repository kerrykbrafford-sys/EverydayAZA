import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// IMPORTANT: We use createBrowserClient (not createClient) because it stores
// the auth session in COOKIES. The middleware uses createServerClient which also
// reads from cookies — they must use the same store or post-login navigation breaks.
//
// Lazily initialized so Next.js prerender at build time doesn't throw
// "supabaseUrl is required" when env vars aren't available yet.

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          // Bypass Web Locks API to avoid 10-second timeout in some browsers.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>): Promise<any> => fn(),
        },
      }
    )
  }
  return _client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string) {
    return (getClient() as any)[prop]
  },
})
