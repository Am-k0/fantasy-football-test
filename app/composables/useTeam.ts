import { ref } from 'vue'
import type { Slot } from '~/types/team'

export function useTeam() {
  const nuxt = useNuxtApp()
  const supabase = nuxt.$supabase
  const slots = ref<Slot[]>([])
  const loading = ref(false)

  const loadTeam = async (userId: string | undefined) => {
    if (!userId) return null
    
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading team:', error)
        return null
      }
      
      if (data) {
        slots.value = data.players
        return data
      }
      
      return null
    } catch (e) {
      console.error('Unexpected error loading team:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  const saveTeam = async (userId: string | undefined, slotsData: Slot[], totalBudget = 100000) => {
    if (!userId) throw new Error('No user id')
    
    loading.value = true
    try {
      const payload = {
        user_id: userId,
        players: slotsData,
        total_budget: totalBudget
      }
      
      const { error } = await supabase
        .from('teams')
        .upsert(payload, { onConflict: 'user_id' })
      
      if (error) throw error
      
      slots.value = slotsData
      return true
    } catch (e) {
      console.error('Error saving team:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteTeam = async (userId: string | undefined) => {
    if (!userId) throw new Error('No user id')
    
    loading.value = true
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('user_id', userId)
      
      if (error) throw error
      
      slots.value = []
      return true
    } catch (e) {
      console.error('Error deleting team:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return { slots, loadTeam, saveTeam, deleteTeam, loading }
}
