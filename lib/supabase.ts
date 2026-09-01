import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://stypnhzdnsgmyngqkpmz.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_vOgEb9epArxrrqI0WE_OZQ_lMSvuU2e'

export const supabase = createClient(supabaseUrl, supabaseKey)
