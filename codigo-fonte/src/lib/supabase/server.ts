// src/lib/supabase/server.ts
import { createClient as _createClient } from '@supabase/supabase-js'

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
           ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Variáveis Supabase não configuradas.')
  }

  return _createClient(url, key)
}