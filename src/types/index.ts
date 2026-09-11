export interface XtreamUserInfo {
  username: string
  auth: number
  status: string
  exp_date?: string
  max_connections?: string
  allowed_output_formats?: string[]
}
export interface XtreamServerInfo {
  url?: string
  port?: string
  timezone?: string
  time_now?: string
}
export interface XtreamLiveStream {
  num?: number
  name: string
  stream_type: string
  stream_id: number | string
  stream_icon?: string
  epg_channel_id?: string
  category_id: string
  direct_source?: string
}
export interface XtreamCategory {
  category_id: string
  category_name: string
  parent_id?: number
}
export type MatchStatus = 'LIVE' | 'UPCOMING' | 'FINISHED'
export interface FootballTeam {
  id?: number
  name: string
  shortName: string
  logo?: string
}
export interface FootballMatch {
  id: string
  competitionId?: string
  competitionName: string
  competitionEmblem?: string
  homeTeam: FootballTeam
  awayTeam: FootballTeam
  status: MatchStatus
  utcDate: string
  minute?: string
  homeScore?: number | null
  awayScore?: number | null
  stage?: string
  venue?: string
}
export interface ChannelCandidate {
  stream: XtreamLiveStream
  score: number
  reason: string
}

// ── Profile system ──────────────────────────────────────────────
export type ProfileLoginStatus = 'connected' | 'expired' | 'failed' | 'never'

export const PROFILE_COLORS = [
  '#00b783', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
] as const

export interface IXtreamProfile {
  id: string
  name: string
  serverUrl: string
  username: string
  avatarColor: string
  avatarInitial: string
  isDefault: boolean
  lastLoginStatus: ProfileLoginStatus
  lastLoginAt: string | null
  createdAt: string
}

export interface RefreshResult {
  channelsFound: number
  newCount: number
  removedCount: number
  updatedCount: number
  categoriesFound: number
}
