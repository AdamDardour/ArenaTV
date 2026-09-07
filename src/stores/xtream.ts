import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  ChannelCandidate,
  FootballMatch,
  XtreamCategory,
  XtreamLiveStream,
  XtreamServerInfo,
  XtreamUserInfo,
} from '@/types'

const SESSION_KEY = 'arenatv.session.v2'
const CATALOG_KEY = 'arenatv.catalog.v2'
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
  function persist() {
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ serverUrl: serverUrl.value, username: username.value }),
      )
    } catch {
      /* remembering the login is optional */
    }
  }
  function cacheCatalog() {
    try {
      localStorage.removeItem(CATALOG_KEY)
    } catch {
      /* storage may be unavailable or full */
    }
  }
  function loadStoredSession() {
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}')
      serverUrl.value = session.serverUrl || ''
      username.value = session.username || ''
      localStorage.removeItem(CATALOG_KEY)
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
    cacheCatalog()
  }
  async function login(url: string, user: string, pass: string) {
    isLoading.value = true
    error.value = null
    serverUrl.value = url.trim()
    username.value = user.trim()
    password.value = pass.trim()
    try {
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
      persist()
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
    // Xtream panels match the username/password segments in a /live/ URL
    // literally against the account record — unlike player_api.php, which
    // reads them from a query string. encodeURIComponent()-ing them here
    // turns any "+  @ ! $ &" etc. in the credentials into %XX sequences the
    // panel no longer recognizes, so login succeeds but every stream request
    // comes back "Unauthorized". Only escape the one character ("/") that
    // would otherwise be mistaken for an extra path segment.
    const pathSafe = (value: string) => value.replace(/\//g, '%2F')
    const allowedFormats = (userInfo.value as { allowed_output_formats?: string[] } | null)
      ?.allowed_output_formats
    const extension = allowedFormats?.length
      ? allowedFormats.includes('m3u8')
        ? 'm3u8'
        : allowedFormats[0]
      : 'm3u8'
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
    localStorage.removeItem(CATALOG_KEY)
  }
  loadStoredSession()
  return {
    serverUrl,
    username,
    password,
    cleanServerUrl,
    isAuthenticated,
    isLoading,
    error,
    userInfo,
    serverInfo,
    liveStreams,
    categories,
    sportsCategories,
    login,
    refreshLibrary,
    getStreamPlaybackUrl,
    candidatesFor,
    logout,
  }
})
