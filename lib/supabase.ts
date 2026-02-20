import { createBrowserClient } from '@supabase/ssr'

// IMPORTANT: We use createBrowserClient (not createClient) because it stores
// the auth session in COOKIES. The middleware uses createServerClient which also
// reads from cookies — they must use the same store or post-login navigation breaks.
//
// The custom no-op `lock` bypasses the Web Locks API (navigator.locks) which
// caused a 10-second timeout in some browsers. The no-op is safe here because
// we're on the browser where race conditions between tabs are acceptable.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>): Promise<any> => fn(),
    },
  }
)

