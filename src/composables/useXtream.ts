import { storeToRefs } from 'pinia'
import { useXtreamStore } from '@/stores/xtream'
export function useXtream() {
  const store = useXtreamStore()
  return {
    ...storeToRefs(store),
    login: store.login,
    initializeSession: store.initializeSession,
    reauthenticate: store.reauthenticate,
    refreshLibrary: store.refreshLibrary,
    refreshChannels: store.refreshChannels,
    switchProfile: store.switchProfile,
    logout: store.logout,
    getStreamPlaybackUrl: store.getStreamPlaybackUrl,
    candidatesFor: store.candidatesFor,
  }
}
