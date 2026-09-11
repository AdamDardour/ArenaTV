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
