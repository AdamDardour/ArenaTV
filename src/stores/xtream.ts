import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { Preferences } from '@capacitor/preferences'
import type {
  ChannelCandidate,
  FootballMatch,
  XtreamCategory,
  XtreamLiveStream,
  XtreamServerInfo,
  XtreamUserInfo,
} from '@/types'

const SESSION_KEY = 'arenatv.session.v2'
const PASSWORD_KEY = 'arenatv.password.v2'
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
  const liveStreams = ref<XtreamLiveStream[]>([])
  const categories = ref<XtreamCategory[]>([])
  const cleanServerUrl = computed(() =>
    (serverUrl.value.startsWith('http') ? serverUrl.value : `http://${serverUrl.value}`).replace(
      /\/+$/,
      '',
    ),
  )
  const sportsCategories = computed(() =>
    categories.value.filter((c) => /sport|football|soccer|bein|dazn|tnt/i.test(c.category_name)),
  )
  // Browser localStorage is intentionally small (often around 5 MB). IPTV catalogues
  // can be much larger, so keep them in memory rather than letting an optional cache
  // turn a successful login into a failed one.
  async function persist() {
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ serverUrl: serverUrl.value, username: username.value }),
      )
      await Preferences.set({ key: PASSWORD_KEY, value: password.value })
    } catch {
      /* remembering the login is optional */
    }
  }
  async function loadStoredSession() {
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}')
      serverUrl.value = session.serverUrl ? normalizeServerUrl(session.serverUrl) : ''
      username.value = session.username || ''
      const storedPassword = await Preferences.get({ key: PASSWORD_KEY })
      password.value = storedPassword.value || ''
    } catch {
      /* stored session and legacy cache are optional */
    }
  }
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
  async function initializeSession() {
    await loadStoredSession()
    if (serverUrl.value && username.value && password.value) await reauthenticate()
    isInitialized.value = true
  }
  async function login(url: string, user: string, pass: string) {
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
      await persist()
      return true
    } catch (cause) {
      isAuthenticated.value = false
      error.value = cause instanceof Error ? cause.message : 'Unable to connect to the IPTV server.'
      return false
    } finally {
      isLoading.value = false
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
    serverUrl.value = ''
    username.value = ''
    password.value = ''
    isAuthenticated.value = false
    userInfo.value = null
    serverInfo.value = null
    liveStreams.value = []
    categories.value = []
    localStorage.removeItem(SESSION_KEY)
    void Preferences.remove({ key: PASSWORD_KEY })
  }
  return {
    serverUrl,
    username,
    password,
    cleanServerUrl,
    isAuthenticated,
    isInitialized,
    isLoading,
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
    getStreamPlaybackUrl,
    candidatesFor,
    logout,
  }
})
