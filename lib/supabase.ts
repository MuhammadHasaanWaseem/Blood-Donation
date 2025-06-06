import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dlpaixgxrwlkdrqxcqpx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscGFpeGd4cndsa2RycXhjcXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyOTQ1MzgsImV4cCI6MjA2Mzg3MDUzOH0.DBjYRXURITtzLFk_EMdy2We-trNVTMsPTGVFGJEJyaI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  localStorage: AsyncStorage as any,
  detectSessionInUrl: false,
  persistSession: true,
  autoRefreshToken: true,
})
