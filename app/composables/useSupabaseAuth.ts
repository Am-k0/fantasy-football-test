import { ref } from 'vue'
import type { Session, User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const loading = ref(false)
const initialized = ref(false)

export function useSupabaseAuth() {
  const nuxt = useNuxtApp()
  const supabase = nuxt.$supabase

  const init = async () => {
    if (initialized.value) return
    
    loading.value = true
    try {
      const { data } = await supabase.auth.getSession()
      session.value = data.session || null
      user.value = data.session?.user || null

      supabase.auth.onAuthStateChange((_event, s) => {
        session.value = s
        user.value = s?.user || null
      })
      
      initialized.value = true
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password })
    if (res.error) throw res.error
    session.value = res.data.session || null
    user.value = res.data.user || null
    return res
  }

  const signUp = async (email: string, password: string) => {
    const res = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/team-builder`
      }
    })
    if (res.error) throw res.error
    return res
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    session.value = null
    user.value = null
  }

  const getUser = () => user.value
  const isAuthenticated = () => !!user.value

  return {
    init,
    signIn,
    signUp,
    signOut,
    getUser,
    isAuthenticated,
    user,
    session,
    loading
  }
}
