import type { SportMonksFixture } from '@/types/sportmonks'
import { getMatchKind, type MatchKind } from '@/utils/matchStatus'

export interface MatchPriorityConfig {
  /** Base weight per bucket. LIVE must always outrank UPCOMING must always
   * outrank FINISHED — keep a wide gap between tiers so no combination of
   * competition/club weight below can cross a bucket boundary. */
  kindWeight: Record<MatchKind, number>
  /** Checked in order; first match wins. Put more prestigious competitions
   * first, since e.g. a name containing both "Europa" and "League" should
   * hit the Europa League rule, not a generic one. */
  competitionTiers: { pattern: RegExp; weight: number }[]
  /** Added on top of competition weight when either side is a big club. */
  majorClubWeight: number
  majorClubs: RegExp[]
  /** How strongly an approaching kickoff or a just-finished result should
   * pull a match up within its own bucket. */
  kickoffUrgency: { maxWeight: number; decayHours: number }
  recentResult: { maxWeight: number; decayHours: number }
}

export const defaultMatchPriorityConfig: MatchPriorityConfig = {
  kindWeight: { live: 10_000, upcoming: 5_000, finished: 1_000 },
  competitionTiers: [
    { pattern: /champions league/i, weight: 300 },
    { pattern: /world cup/i, weight: 300 },
    { pattern: /european championship|\beuro\b/i, weight: 280 },
    { pattern: /nations league/i, weight: 240 },
    { pattern: /premier league/i, weight: 260 },
    { pattern: /la ?liga/i, weight: 250 },
    { pattern: /bundesliga/i, weight: 240 },
    { pattern: /serie a/i, weight: 230 },
    { pattern: /ligue 1/i, weight: 220 },
    { pattern: /europa league/i, weight: 210 },
    { pattern: /conference league/i, weight: 170 },
  ],
  majorClubWeight: 120,
  majorClubs: [
    /real madrid/i,
    /\bbarcelona\b/i,
    /manchester (united|city)/i,
    /\bliverpool\b/i,
    /\barsenal\b/i,
    /\bchelsea\b/i,
    /bayern/i,
    /paris saint|\bpsg\b/i,
    /juventus/i,
    /inter( milan)?/i,
    /ac milan/i,
    /tottenham/i,
    /borussia dortmund/i,
    /napoli/i,
  ],
  kickoffUrgency: { maxWeight: 150, decayHours: 6 },
  recentResult: { maxWeight: 100, decayHours: 3 },
}

function competitionWeight(fixture: SportMonksFixture, config: MatchPriorityConfig): number {
  const name = fixture.league?.name
  if (!name) return 0
  return config.competitionTiers.find((tier) => tier.pattern.test(name))?.weight ?? 0
}

function clubWeight(fixture: SportMonksFixture, config: MatchPriorityConfig): number {
  const teams = fixture.participants?.map((p) => p.name).join(' | ') ?? fixture.name
  return config.majorClubs.some((pattern) => pattern.test(teams)) ? config.majorClubWeight : 0
}

/** Linear decay from maxWeight down to 0 over `decayHours`, floored at 0. */
function decayWeight(hours: number, maxWeight: number, decayHours: number): number {
  return Math.max(0, maxWeight * (1 - hours / decayHours))
}

function timingWeight(
  fixture: SportMonksFixture,
  kind: MatchKind,
  config: MatchPriorityConfig,
  now: Date,
): number {
  const hoursUntilKickoff = (fixture.starting_at_timestamp * 1000 - now.getTime()) / 3_600_000
  if (kind === 'upcoming') {
    return decayWeight(Math.max(0, hoursUntilKickoff), config.kickoffUrgency.maxWeight, config.kickoffUrgency.decayHours)
  }
  if (kind === 'finished') {
    const hoursSinceFinish = -hoursUntilKickoff
    return decayWeight(Math.max(0, hoursSinceFinish), config.recentResult.maxWeight, config.recentResult.decayHours)
  }
  return 0
}

export function priorityScore(
  fixture: SportMonksFixture,
  kind: MatchKind = getMatchKind(fixture),
  config: MatchPriorityConfig = defaultMatchPriorityConfig,
  now: Date = new Date(),
): number {
  return (
    config.kindWeight[kind] +
    competitionWeight(fixture, config) +
    clubWeight(fixture, config) +
    timingWeight(fixture, kind, config, now)
  )
}

export function sortByPriority(
  fixtures: SportMonksFixture[],
  config: MatchPriorityConfig = defaultMatchPriorityConfig,
  now: Date = new Date(),
): SportMonksFixture[] {
  return [...fixtures].sort((a, b) => priorityScore(b, undefined, config, now) - priorityScore(a, undefined, config, now))
}
