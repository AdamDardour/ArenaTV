import { storeToRefs } from 'pinia'
import { useXtreamStore } from '@/stores/xtream'
export function useXtream() {
  const store = useXtreamStore()
  return {
    ...storeToRefs(store),
    login: store.login,
    refreshLibrary: store.refreshLibrary,
    logout: store.logout,
    getStreamPlaybackUrl: store.getStreamPlaybackUrl,
    candidatesFor: store.candidatesFor,
  }
}
