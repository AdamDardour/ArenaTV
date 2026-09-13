import type { SportMonksFixture, SportMonksParticipant } from '@/types/sportmonks'

export type MatchKind = 'live' | 'upcoming' | 'finished'

// Bucketing is driven by `state.developer_name`, SportMonks' stable status
// identifier — not `state_id`, which is just an internal integer. Extend
// these sets if SportMonks adds new in-play or terminal states; anything
// not listed here defaults to "upcoming" (see getMatchKind), which is the
// safe default for a fixture that hasn't been assigned a state yet.
const LIVE_STATES = new Set([
  'INPLAY_1ST_HALF',
  'INPLAY_2ND_HALF',
  'INPLAY_ET',
  'INPLAY_PENALTIES',
  'HT',
  'BREAK',
  'EXTRA_TIME_BREAK',
  'PEN_BREAK',
  'INTERRUPTED',
  'SUSPENDED',
])
const FINISHED_STATES = new Set([
  'FT',
  'AET',
  'FT_PEN',
  'CANCELLED',
  'ABANDONED',
  'AWARDED',
  'WO',
])

export function getMatchKind(fixture: SportMonksFixture): MatchKind {
  const dev = fixture.state?.developer_name
  if (!dev) return 'upcoming'
  if (LIVE_STATES.has(dev)) return 'live'
  if (FINISHED_STATES.has(dev)) return 'finished'
  return 'upcoming'
}

export interface FixtureParticipants {
  home: SportMonksParticipant | null
  away: SportMonksParticipant | null
}

export function getParticipants(fixture: SportMonksFixture): FixtureParticipants {
  const participants = fixture.participants ?? []
  return {
    home: participants.find((p) => p.meta?.location === 'home') ?? null,
    away: participants.find((p) => p.meta?.location === 'away') ?? null,
  }
}

export interface FixtureScore {
  home: number
  away: number
}

/** The CURRENT score reflects the latest state regardless of whether the
 * match ended after regulation, extra time, or penalties — always prefer it
 * over summing individual period scores. Returns null before kickoff, when
 * no CURRENT entry exists yet. */
export function getScore(fixture: SportMonksFixture): FixtureScore | null {
  const current = (fixture.scores ?? []).filter((s) => s.description === 'CURRENT')
  if (!current.length) return null
  return {
    home: current.find((s) => s.score.participant === 'home')?.score.goals ?? 0,
    away: current.find((s) => s.score.participant === 'away')?.score.goals ?? 0,
  }
}

/** The active match clock, e.g. "67'", or "HT" during the break. Null when
 * the match isn't live or the `periods` include isn't available on your
 * subscription — always guard for that in the UI. */
export function getLiveMinute(fixture: SportMonksFixture): string | null {
  const ticking = (fixture.periods ?? []).find((p) => p.ticking)
  if (ticking) {
    const stoppage = ticking.time_added && ticking.minutes >= ticking.counts_from + 45 ? `+${ticking.time_added}` : ''
    return `${ticking.minutes}${stoppage}'`
  }
  if (fixture.state?.developer_name === 'HT') return 'HT'
  if (fixture.state?.developer_name === 'BREAK') return 'BREAK'
  return null
}

export function getStatusLabel(fixture: SportMonksFixture): string {
  return fixture.state?.short_name ?? 'NS'
}

export function formatKickoffTime(fixture: SportMonksFixture, locale?: string): string {
  return new Date(fixture.starting_at_timestamp * 1000).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export interface Countdown {
  totalMs: number
  hours: number
  minutes: number
  seconds: number
}

/** Time remaining until kickoff, clamped to zero once it has passed (at
 * which point the fixture should transition out of "upcoming" on its own
 * once SportMonks reports a LIVE state). */
export function getCountdown(fixture: SportMonksFixture, now: Date = new Date()): Countdown {
  const totalMs = Math.max(0, fixture.starting_at_timestamp * 1000 - now.getTime())
  const totalSeconds = Math.floor(totalMs / 1000)
  return {
    totalMs,
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

export function formatCountdown(countdown: Countdown): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)}`
}
