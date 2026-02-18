import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

// Use the service role key so the backend bypasses RLS and can access all rows.
// Never expose this key to the frontend.
export const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
