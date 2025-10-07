import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kgokgtepegykzxjrvqkm.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnb2tndGVwZWd5a3p4anJ2cWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3Mzg0NzksImV4cCI6MjA3NTMxNDQ3OX0.q40V1bI4MGAT2y9FGpvRaxYf_w5wtm-XSpzvgH9_AsI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
const supabaseAdminUrl = process.env.SUPABASE_URL || 'https://kgokgtepegykzxjrvqkm.supabase.co'
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnb2tndGVwZWd5a3p4anJ2cWttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTczODQ3OSwiZXhwIjoyMDc1MzE0NDc5fQ.4lWdtQPquOcniAMY'

export const supabaseAdmin = createClient(
  supabaseAdminUrl,
  supabaseAdminKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
