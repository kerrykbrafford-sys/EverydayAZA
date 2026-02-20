import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-side admin client — uses the SERVICE ROLE key (bypasses RLS).
// Only use in API routes (server-side), never in client components.
// Lazily initialized so Next.js build doesn't fail when env vars aren't
// available at module-evaluation time during static page collection.

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
    if (!_client) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!url || !key) {
            throw new Error(
                'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
            )
        }
        _client = createClient(url, key)
    }
    return _client
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_target, prop: string) {
        return (getClient() as any)[prop]
    },
})
