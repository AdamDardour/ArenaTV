import type { FootballMatch } from '@/types'

export interface SportsProvider {
  getLiveMatches(): Promise<FootballMatch[]>
  getUpcomingMatches(): Promise<FootballMatch[]>
  getMatchDetails(id: string): Promise<FootballMatch | null>
  getLineups(id: string): Promise<unknown | null>
  getCompetitions(): Promise<{ id: string; name: string; emblem?: string }[]>
  searchTeams(query: string): Promise<unknown[]>
}
type ApiMatch = {
  id: number
  utcDate: string
  status: string
  stage?: string
  venue?: string
  competition: { id: number; name: string; emblem?: string }
  homeTeam: { id: number; name: string; shortName?: string; crest?: string }
  awayTeam: { id: number; name: string; shortName?: string; crest?: string }
  score: {
    fullTime?: { home?: number; away?: number }
    halfTime?: { home?: number; away?: number }
  }
}
const toMatch = (m: ApiMatch): FootballMatch => ({
  id: String(m.id),
  competitionId: String(m.competition.id),
  competitionName: m.competition.name,
  competitionEmblem: m.competition.emblem,
  status: ['IN_PLAY', 'PAUSED', 'LIVE'].includes(m.status)
    ? 'LIVE'
    : m.status === 'FINISHED'
      ? 'FINISHED'
      : 'UPCOMING',
  utcDate: m.utcDate,
  stage: m.stage,
  venue: m.venue,
  homeScore: m.score.fullTime?.home ?? m.score.halfTime?.home ?? null,
  awayScore: m.score.fullTime?.away ?? m.score.halfTime?.away ?? null,
  homeTeam: {
    id: m.homeTeam.id,
    name: m.homeTeam.name,
    shortName: m.homeTeam.shortName || m.homeTeam.name,
    logo: m.homeTeam.crest,
  },
  awayTeam: {
    id: m.awayTeam.id,
    name: m.awayTeam.name,
    shortName: m.awayTeam.shortName || m.awayTeam.name,
    logo: m.awayTeam.crest,
  },
})
export class FootballDataProvider implements SportsProvider {
  constructor(private readonly proxyUrl: string) {}
  private async request<T>(path: string): Promise<T> {
    if (!this.proxyUrl)
      throw new Error(
        'Sports data is not configured. Connect a server-side Football-Data.org proxy in Settings.',
      )
    const response = await fetch(`${this.proxyUrl.replace(/\/$/, '')}${path}`)
    if (!response.ok) throw new Error(`Sports provider returned ${response.status}`)
    return (await response.json()) as T
  }
  async getLiveMatches() {
    const data = await this.request<{ matches: ApiMatch[] }>('/matches?status=IN_PLAY,PAUSED')
    return data.matches.map(toMatch)
  }
  async getUpcomingMatches() {
    const date = (offset: number) =>
      new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10)
    const data = await this.request<{ matches: ApiMatch[] }>(
      `/matches?dateFrom=${date(0)}&dateTo=${date(7)}`,
    )
    return data.matches.map(toMatch)
  }
  async getMatchDetails(id: string) {
    return toMatch(await this.request<ApiMatch>(`/matches/${id}`))
  }
  async getLineups() {
    return null
  }
  async getCompetitions() {
    const data = await this.request<{
      competitions: { id: number; name: string; emblem?: string }[]
    }>('/competitions')
    return data.competitions.map((c) => ({ id: String(c.id), name: c.name, emblem: c.emblem }))
  }
  async searchTeams() {
    return []
  }
}
