import type { SportMonksApiResponse, SportMonksFixture } from '@/types/sportmonks'

const BASE_URL = import.meta.env.VITE_SPORTMONKS_PROXY_URL || '/sportmonks'
// participants -> team names/logos/home-away; scores -> goals per period;
// state -> lifecycle (NS/LIVE/FT/...); league -> competition name/logo;
// periods -> live match clock (ticking period's `minutes`).
const INCLUDES = 'participants;scores;state;league;periods'
const REQUEST_TIMEOUT_MS = 10_000

/** Local calendar date as YYYY-MM-DD, matching the format SportMonks expects
 * for the fixtures/between endpoint. Uses the device's local date, since
 * that's what "today" means to someone watching this on their TV. */
function todayISODate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function request(path: string, extraParams: Record<string, string> = {}) {
  const params = new URLSearchParams({ include: INCLUDES, ...extraParams })
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(`${BASE_URL}${path}?${params}`, { signal: controller.signal })
    if (!res.ok) {
      if (res.status === 401) throw new Error('SportMonks rejected the API token.')
      if (res.status === 429) throw new Error('SportMonks rate limit reached — try again shortly.')
      throw new Error(`SportMonks request failed (${res.status}).`)
    }
    const json = (await res.json()) as SportMonksApiResponse<SportMonksFixture | SportMonksFixture[]>
    if (Array.isArray(json.data)) return json.data
    return json.data ? [json.data] : []
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw new Error('SportMonks did not respond in time.')
    }
    throw cause
  } finally {
    clearTimeout(timer)
  }
}

/** Today's fixtures across every competition in the subscription, including
 * ones that haven't kicked off yet and ones already finished. This is the
 * full, expensive call — done once on load and again on a slow interval,
 * never on every tick. */
export function fetchTodaysFixtures(): Promise<SportMonksFixture[]> {
  const date = todayISODate()
  return request(`/fixtures/between/${date}/${date}`)
}

/** Fixtures currently live (roughly 15 minutes before kickoff through 15
 * minutes after full time). Cheap and meant to be polled frequently — merge
 * results into your existing fixture list by id rather than replacing it. */
export function fetchInplayFixtures(): Promise<SportMonksFixture[]> {
  return request('/livescores/inplay')
}
