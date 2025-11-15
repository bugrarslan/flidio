import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import { createClient, processLock } from '@supabase/supabase-js'
import type { SupportedStorage } from '@supabase/supabase-js'
import { asyncStorageService } from '@/services/asyncStorage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string

// Custom storage adapter that uses our asyncStorageService
// This ensures all Supabase session data follows our storage conventions
const SUPABASE_STORAGE_PREFIX = '@flidio:supabase:'

const customSupabaseStorage: SupportedStorage = {
  getItem: async (key: string) => {
    const value = await asyncStorageService.getItem<string>(key, {
      prefix: SUPABASE_STORAGE_PREFIX,
    })
    return value
  },
  setItem: async (key: string, value: string) => {
    await asyncStorageService.setItem(key, value, SUPABASE_STORAGE_PREFIX)
  },
  removeItem: async (key: string) => {
    await asyncStorageService.removeItem(key, SUPABASE_STORAGE_PREFIX)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== "web" ? { storage: customSupabaseStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
})

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
if (Platform.OS !== "web") {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}