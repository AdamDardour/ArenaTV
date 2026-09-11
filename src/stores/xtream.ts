import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type {
  ChannelCandidate,
  FootballMatch,
  RefreshResult,
  XtreamCategory,
  XtreamLiveStream,
  XtreamServerInfo,
  XtreamUserInfo,
} from '@/types'
import { useProfileStore } from '@/stores/profiles'
import * as db from '@/services/db'

function normalizeServerUrl(value: string) {
  const input = value.trim()
  const withScheme = /^https?:\/\//i.test(input) ? input : `http://${input}`
  const url = new URL(withScheme)
  const endpointPattern = /\/(?:player_api|xmltv|get)\.php$/i
  const basePath = url.pathname.replace(endpointPattern, '').replace(/\/+$/, '')
  return `${url.origin}${basePath}`
}
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\[[^\]]*\]|\([^)]*\)/g, ' ')
    .replace(/\b(4k|uhd|fhd|hd|sd|vip|raw|50fps|60fps)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

export const useXtreamStore = defineStore('xtream', () => {
  const serverUrl = ref('')
  const username = ref('')
  const password = ref('')
  const isAuthenticated = ref(false)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const userInfo = ref<XtreamUserInfo | null>(null)
  const serverInfo = ref<XtreamServerInfo | null>(null)
  // Use shallowRef for large arrays — avoids deep reactivity overhead
  const liveStreams = shallowRef<XtreamLiveStream[]>([])
  const categories = shallowRef<XtreamCategory[]>([])

  // Refresh progress state
  const isRefreshing = ref(false)
  const refreshProgress = ref<RefreshResult | null>(null)

  const cleanServerUrl = computed(() =>
    (serverUrl.value.startsWith('http') ? serverUrl.value : `http://${serverUrl.value}`).replace(
      /\/+$/,
      '',
    ),
  )
  const sportsCategories = computed(() =>
    categories.value.filter((c) => /sport|football|soccer|bein|dazn|tnt/i.test(c.category_name)),
  )

  async function request<T>(action?: string): Promise<T> {
    const query = new URLSearchParams({ username: username.value, password: password.value })
    if (action) query.set('action', action)
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch(`${cleanServerUrl.value}/player_api.php?${query}`, {
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      return (await res.json()) as T
    } finally {
      clearTimeout(timer)
    }
  }

  async function refreshLibrary() {
    const [categoryData, streamData] = await Promise.all([
      request<XtreamCategory[]>('get_live_categories'),
      request<XtreamLiveStream[]>('get_live_streams'),
    ])
    categories.value = Array.isArray(categoryData) ? categoryData : []
    liveStreams.value = Array.isArray(streamData) ? streamData : []
    if (!liveStreams.value.length) throw new Error('This account has no live channels.')

    // Persist to IndexedDB for the active profile
    const profileStore = useProfileStore()
    const profileId = profileStore.activeProfileId
    if (profileId) {
      await db.putChannels(profileId, liveStreams.value)
      await db.putCategories(profileId, categories.value)
      await db.putCacheMetadata({
        profileId,
        lastUpdated: new Date().toISOString(),
        channelCount: liveStreams.value.length,
        categoryCount: categories.value.length,
      })
    }
  }

  /** Intelligent channel refresh — diff against cache, preserve user data */
  async function refreshChannels(): Promise<RefreshResult> {
    isRefreshing.value = true
    refreshProgress.value = null
    try {
      const [categoryData, streamData] = await Promise.all([
        request<XtreamCategory[]>('get_live_categories'),
        request<XtreamLiveStream[]>('get_live_streams'),
      ])

      const newCategories = Array.isArray(categoryData) ? categoryData : []
      const newStreams = Array.isArray(streamData) ? streamData : []

      // Compute diff against cached data
      const profileStore = useProfileStore()
      const profileId = profileStore.activeProfileId
      let result: RefreshResult = {
        channelsFound: newStreams.length,
        newCount: newStreams.length,
        removedCount: 0,
        updatedCount: 0,
        categoriesFound: newCategories.length,
      }

      if (profileId) {
        result = await db.diffChannels(profileId, newStreams)
        result.categoriesFound = newCategories.length

        // Write updated data to IndexedDB (preserves favorites/recently watched)
        await db.putChannels(profileId, newStreams)
        await db.putCategories(profileId, newCategories)
        await db.putCacheMetadata({
          profileId,
          lastUpdated: new Date().toISOString(),
          channelCount: newStreams.length,
          categoryCount: newCategories.length,
        })
      }

      // Update in-memory state
      categories.value = newCategories
      liveStreams.value = newStreams
      refreshProgress.value = result

      return result
    } finally {
      isRefreshing.value = false
    }
  }

  async function reauthenticate() {
    if (!serverUrl.value || !username.value || !password.value) {
      isAuthenticated.value = false
      return false
    }
    try {
      const response = await request<{ user_info?: XtreamUserInfo; server_info?: XtreamServerInfo }>()
      if (
        response.user_info?.auth !== 1 ||
        /expired|disabled/i.test(response.user_info.status || '')
      )
        throw new Error('The account could not be authorized.')
      userInfo.value = response.user_info
      serverInfo.value = response.server_info || null
      isAuthenticated.value = true
      return true
    } catch {
      isAuthenticated.value = false
      return false
    }
  }

  /** Initialize session from the active profile's cached data */
  async function initializeSession() {
    const profileStore = useProfileStore()

    // Load profiles first
    if (!profileStore.loaded) {
      await profileStore.loadProfiles()
    }

    // Auto-migrate legacy session
    const migrated = await profileStore.migrateFromLegacy()

    // Determine which profile to use
    const targetProfileId = profileStore.defaultProfileId || migrated?.id || profileStore.activeProfileId
    if (!targetProfileId) {
      isInitialized.value = true
      return
    }

    const profile = profileStore.profiles.find((p) => p.id === targetProfileId)
    if (!profile) {
      isInitialized.value = true
      return
    }

    // Load credentials
    serverUrl.value = profile.serverUrl ? normalizeServerUrl(profile.serverUrl) : ''
    username.value = profile.username || ''
    password.value = await profileStore.getPassword(targetProfileId)

    profileStore.setActive(targetProfileId)

    // Load cached data from IndexedDB for instant display
    try {
      const [cachedChannels, cachedCategories] = await Promise.all([
        db.getChannels(targetProfileId),
        db.getCategories(targetProfileId),
      ])
      if (cachedChannels.length) liveStreams.value = cachedChannels
      if (cachedCategories.length) categories.value = cachedCategories
    } catch {
      /* cache is optional */
    }

    // Attempt authentication
    if (serverUrl.value && username.value && password.value) {
      const authenticated = await reauthenticate()
      if (authenticated) {
        await profileStore.updateLoginStatus(targetProfileId, 'connected')
      } else {
        await profileStore.updateLoginStatus(targetProfileId, 'failed')
      }
    }

    isInitialized.value = true
  }

  /** Login with explicit credentials — creates/updates a profile */
  async function login(url: string, user: string, pass: string, profileName?: string) {
    isLoading.value = true
    error.value = null
    username.value = user.trim()
    password.value = pass.trim()
    try {
      serverUrl.value = normalizeServerUrl(url)
      const response = await request<{
        user_info?: XtreamUserInfo
        server_info?: XtreamServerInfo
      }>()
      if (
        response.user_info?.auth !== 1 ||
        /expired|disabled/i.test(response.user_info.status || '')
      )
        throw new Error('The account could not be authorized.')
      userInfo.value = response.user_info
      serverInfo.value = response.server_info || null
      isAuthenticated.value = true
      await refreshLibrary()

      // Create or update profile
      const profileStore = useProfileStore()
      const existing = profileStore.profiles.find(
        (p) => p.serverUrl === serverUrl.value && p.username === username.value,
      )
      if (existing) {
        profileStore.setActive(existing.id)
        await profileStore.updateLoginStatus(existing.id, 'connected')
        // Update password in case it changed
        await profileStore.updateProfile(existing.id, { password: password.value })
      } else {
        const profile = await profileStore.createProfile({
          name: profileName || username.value,
          serverUrl: serverUrl.value,
          username: username.value,
          password: password.value,
        })
        profileStore.setActive(profile.id)
        await profileStore.updateLoginStatus(profile.id, 'connected')
      }

      return true
    } catch (cause) {
      isAuthenticated.value = false
      error.value = cause instanceof Error ? cause.message : 'Unable to connect to the IPTV server.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /** Switch to a different profile without re-entering credentials */
  async function switchProfile(profileId: string) {
    const profileStore = useProfileStore()
    const profile = profileStore.profiles.find((p) => p.id === profileId)
    if (!profile) return false

    isLoading.value = true
    error.value = null

    // Set credentials from profile
    serverUrl.value = profile.serverUrl ? normalizeServerUrl(profile.serverUrl) : ''
    username.value = profile.username
    password.value = await profileStore.getPassword(profileId)

    profileStore.setActive(profileId)

    // Load cached data from IndexedDB instantly
    try {
      const [cachedChannels, cachedCategories] = await Promise.all([
        db.getChannels(profileId),
        db.getCategories(profileId),
      ])
      if (cachedChannels.length) liveStreams.value = cachedChannels
      if (cachedCategories.length) categories.value = cachedCategories
    } catch {
      /* cache is optional */
    }

    // Authenticate
    try {
      const authenticated = await reauthenticate()
      if (authenticated) {
        await profileStore.updateLoginStatus(profileId, 'connected')
        await refreshLibrary()
        isLoading.value = false
        return true
      } else {
        await profileStore.updateLoginStatus(profileId, 'failed')
        isLoading.value = false
        return false
      }
    } catch {
      isLoading.value = false
      return false
    }
  }

  function getStreamPlaybackUrl(stream: XtreamLiveStream) {
    if (stream.direct_source) return stream.direct_source
    // Credentials are query parameters during login but path segments during playback.
    // Encode each segment so characters such as #, ?, &, and / cannot alter the stream URL.
    const pathSafe = (value: string) => encodeURIComponent(value)
    const streamType = stream.stream_type.toLowerCase()
    const allowedFormats = (userInfo.value?.allowed_output_formats || []).map((format) =>
      format.toLowerCase(),
    )
    const extension =
      streamType.includes('m3u8') || streamType.includes('hls')
        ? 'm3u8'
        : allowedFormats.includes('m3u8') && !allowedFormats.includes('ts')
          ? 'm3u8'
          : 'ts'
    return `${cleanServerUrl.value}/live/${pathSafe(username.value)}/${pathSafe(password.value)}/${stream.stream_id}.${extension}`
  }
  function candidatesFor(match: FootballMatch): ChannelCandidate[] {
    const terms = [
      match.competitionName,
      match.homeTeam.name,
      match.awayTeam.name,
      'sports',
      'football',
    ]
      .map(normalize)
      .flatMap((v) => v.split(' ').filter((x) => x.length > 3))
    return liveStreams.value
      .map((stream) => {
        const haystack = normalize(
          `${stream.name} ${categories.value.find((c) => c.category_id === stream.category_id)?.category_name || ''}`,
        )
        const hits = terms.filter((term) => haystack.includes(term))
        return {
          stream,
          score: Math.min(
            100,
            hits.length * 18 + (/sport|football|bein|dazn|tnt/i.test(haystack) ? 20 : 0),
          ),
          reason: hits.length ? `Matches ${hits.slice(0, 2).join(' · ')}` : 'Sports library result',
        }
      })
      .filter((item) => item.score >= 35)
      .sort((a, b) => b.score - a.score)
  }
  function logout() {
    const profileStore = useProfileStore()
    const profileId = profileStore.activeProfileId

    serverUrl.value = ''
    username.value = ''
    password.value = ''
    isAuthenticated.value = false
    userInfo.value = null
    serverInfo.value = null
    liveStreams.value = []
    categories.value = []

    if (profileId) {
      void profileStore.updateLoginStatus(profileId, 'never')
    }

    profileStore.activeProfileId = null
    localStorage.removeItem('arenatv.activeProfileId')
  }
  return {
    serverUrl,
    username,
    password,
    cleanServerUrl,
    isAuthenticated,
    isInitialized,
    isLoading,
    isRefreshing,
    refreshProgress,
    error,
    userInfo,
    serverInfo,
    liveStreams,
    categories,
    sportsCategories,
    login,
    initializeSession,
    reauthenticate,
    refreshLibrary,
    refreshChannels,
    switchProfile,
    getStreamPlaybackUrl,
    candidatesFor,
    logout,
  }
})
