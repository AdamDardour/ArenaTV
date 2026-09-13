import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { fetchInplayFixtures, fetchTodaysFixtures } from '@/services/sportmonks'
import { getMatchKind } from '@/utils/matchStatus'
import { sortByPriority } from '@/utils/matchPriority'
import type { SportMonksFixture } from '@/types/sportmonks'

// Live scores are cheap and change often -> poll frequently.
// The full today's-fixtures call is comparatively expensive (bigger
// response, more of your SportMonks plan's request budget) and mainly
// exists to notice matches newly added to the schedule or fixtures the
// livescores feed has already dropped -> refresh it far less often.
const LIVE_POLL_MS = 20_000
const FULL_REFRESH_MS = 5 * 60_000
// SportMonks' inplay endpoint surfaces a fixture starting 15 minutes before
// kickoff. Poll a little before that window opens so a match doesn't sit in
// "upcoming" for a few extra ticks after it's actually gone live.
const IMMINENT_KICKOFF_MS = 15 * 60_000

export function useFootball() {
  const fixturesById = reactive(new Map<number, SportMonksFixture>())
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const lastUpdatedAt = ref<Date | null>(null)

  let livePollTimer: number | undefined
  let fullRefreshTimer: number | undefined

  const fixtures = computed(() => [...fixturesById.values()])
  const liveMatches = computed(() =>
    sortByPriority(fixtures.value.filter((f) => getMatchKind(f) === 'live')),
  )
  const upcomingMatches = computed(() =>
    sortByPriority(fixtures.value.filter((f) => getMatchKind(f) === 'upcoming')),
  )
  const finishedMatches = computed(() =>
    sortByPriority(fixtures.value.filter((f) => getMatchKind(f) === 'finished')),
  )
  const featuredMatch = computed(() => sortByPriority(fixtures.value)[0] ?? null)

  // Sections render "every other match", so the featured fixture is
  // excluded from its own bucket rather than shown twice.
  const otherLiveMatches = computed(() => excludeFeatured(liveMatches.value))
  const otherUpcomingMatches = computed(() => excludeFeatured(upcomingMatches.value))
  const otherFinishedMatches = computed(() => excludeFeatured(finishedMatches.value))
  function excludeFeatured(list: SportMonksFixture[]) {
    return featuredMatch.value ? list.filter((f) => f.id !== featuredMatch.value!.id) : list
  }

  function mergeFixtures(list: SportMonksFixture[]) {
    for (const fixture of list) fixturesById.set(fixture.id, fixture)
  }

  function hasImminentKickoff() {
    const now = Date.now()
    return fixtures.value.some((f) => {
      const msUntilKickoff = f.starting_at_timestamp * 1000 - now
      return msUntilKickoff > 0 && msUntilKickoff < IMMINENT_KICKOFF_MS
    })
  }

  async function load() {
    isLoading.value = fixturesById.size === 0
    error.value = null
    try {
      const todays = await fetchTodaysFixtures()
      fixturesById.clear()
      mergeFixtures(todays)
      lastUpdatedAt.value = new Date()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Unable to load today’s fixtures.'
    } finally {
      isLoading.value = false
    }
  }

  async function refreshLiveScores() {
    if (!liveMatches.value.length && !hasImminentKickoff()) return
    try {
      const inplay = await fetchInplayFixtures()
      mergeFixtures(inplay)
      lastUpdatedAt.value = new Date()
      // A missed poll shouldn't leave a stale error banner up once scores
      // are flowing again.
      error.value = null
    } catch {
      // Silent by design: one dropped tick over a flaky TV Wi-Fi connection
      // shouldn't cover a working screen with an error banner. The next
      // tick retries automatically.
    }
  }

  function startPolling() {
    stopPolling()
    livePollTimer = window.setInterval(refreshLiveScores, LIVE_POLL_MS)
    fullRefreshTimer = window.setInterval(load, FULL_REFRESH_MS)
  }
  function stopPolling() {
    window.clearInterval(livePollTimer)
    window.clearInterval(fullRefreshTimer)
  }
  // Pause polling while the app is backgrounded so a returning-from-sleep
  // Android TV box isn't immediately hit with a burst of catch-up requests,
  // and resume with one immediate refresh so scores aren't stale on return.
  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      stopPolling()
    } else {
      refreshLiveScores()
      startPolling()
    }
  }

  onMounted(async () => {
    await load()
    startPolling()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })
  onUnmounted(() => {
    stopPolling()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    isLoading,
    error,
    lastUpdatedAt,
    featuredMatch,
    liveMatches: otherLiveMatches,
    upcomingMatches: otherUpcomingMatches,
    finishedMatches: otherFinishedMatches,
    reload: load,
  }
}
