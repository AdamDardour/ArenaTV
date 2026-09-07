import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { FootballMatch } from '@/types'
import { FootballDataProvider } from '@/services/sports/footballDataProvider'
const CACHE_KEY = 'arenatv.sports.v1'
const TTL = 90_000
export const useSportsStore = defineStore('sports', () => {
  const matches = ref<FootballMatch[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const updatedAt = ref(0)
  const provider = new FootballDataProvider(import.meta.env.VITE_SPORTS_PROXY_URL || '')
  const live = computed(() => matches.value.filter((m) => m.status === 'LIVE'))
  const upcoming = computed(() => matches.value.filter((m) => m.status === 'UPCOMING'))
  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
      if (Array.isArray(saved.matches)) {
        matches.value = saved.matches
        updatedAt.value = saved.updatedAt || 0
      }
    } catch {
      /* cache is optional */
    }
  }
  async function refresh(force = false) {
    if (!force && Date.now() - updatedAt.value < TTL) return
    loading.value = true
    error.value = null
    try {
      const [now, next] = await Promise.all([
        provider.getLiveMatches(),
        provider.getUpcomingMatches(),
      ])
      matches.value = [
        ...now,
        ...next.filter((item) => !now.some((liveMatch) => liveMatch.id === item.id)),
      ]
      updatedAt.value = Date.now()
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ matches: matches.value, updatedAt: updatedAt.value }),
      )
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Live scores are unavailable.'
    } finally {
      loading.value = false
    }
  }
  restore()
  return { matches, live, upcoming, loading, error, updatedAt, refresh }
})
