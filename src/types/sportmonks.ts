// Minimal typings for the subset of the SportMonks v3 Football API this app
// uses. These are intentionally not exhaustive — only fields actually read
// by matchStatus.ts / matchPriority.ts / the UI are typed. Extend as needed
// if you add more includes.

export interface SportMonksApiResponse<T> {
  data: T
}

export interface SportMonksState {
  id: number
  state: string
  name: string
  short_name: string
  /** Stable identifier to branch on — e.g. "LIVE", "HT", "FT". Prefer this
   * over `id`, which SportMonks does not guarantee is stable across time. */
  developer_name: string
}

export interface SportMonksLeague {
  id: number
  name: string
  image_path?: string | null
}

export interface SportMonksParticipantMeta {
  location: 'home' | 'away'
  winner: boolean | null
  position?: number
}

export interface SportMonksParticipant {
  id: number
  name: string
  short_code?: string | null
  image_path?: string | null
  meta: SportMonksParticipantMeta
}

export interface SportMonksScoreEntry {
  id: number
  fixture_id: number
  type_id: number
  participant_id: number
  /** Human-readable period label, e.g. "1ST_HALF", "CURRENT", "PENALTIES". */
  description: string
  score: {
    goals: number
    /** Despite the name, this is a location ("home" | "away"), not a team id. */
    participant: 'home' | 'away'
  }
}

export interface SportMonksPeriod {
  id: number
  fixture_id: number
  type_id: number
  started: number
  ended: number | null
  counts_from: number
  /** True for the single period currently being played. */
  ticking: boolean
  sort_order: number
  description?: string
  time_added?: number | null
  minutes: number
  seconds: number
}

export interface SportMonksFixture {
  id: number
  sport_id: number
  league_id: number
  season_id: number
  state_id: number
  name: string
  /** "YYYY-MM-DD HH:mm:ss", server-side timezone — prefer starting_at_timestamp. */
  starting_at: string
  /** Unix seconds, UTC — use this for all local-time math. */
  starting_at_timestamp: number
  result_info?: string | null
  participants?: SportMonksParticipant[]
  scores?: SportMonksScoreEntry[]
  state?: SportMonksState
  league?: SportMonksLeague
  periods?: SportMonksPeriod[]
}
