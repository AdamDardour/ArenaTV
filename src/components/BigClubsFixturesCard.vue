<template>
  <article tabindex="0" :aria-label="ariaLabel"
    class="group relative flex h-96 flex-col overflow-hidden rounded-3xl border border-white/10 p-4 glassmorphism">
    <!-- ========================================================= -->
    <!-- Ambient background: HOME                                  -->
    <!-- ========================================================= -->
    <div v-if="fixture.home?.logo && !homeLogoError"
      class="pointer-events-none absolute inset-y-0 left-0 w-1/2 overflow-hidden" aria-hidden="true">
      <img :src="fixture.home.logo" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"
        class="absolute left-1/2 top-1/2 size-88 max-w-none -translate-x-1/2 -translate-y-1/2 scale-125 object-contain opacity-[0.8] blur-2xl"
        @error="homeLogoError = true" />

      <!-- Extra color/glow from the home side -->
      <div class="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-black/20" />
    </div>

    <!-- ========================================================= -->
    <!-- Ambient background: AWAY                                  -->
    <!-- ========================================================= -->
    <div v-if="fixture.away?.logo && !awayLogoError"
      class="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden" aria-hidden="true">
      <img :src="fixture.away.logo" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"
        class="absolute left-1/2 top-1/2 size-88 max-w-none -translate-x-1/2 -translate-y-1/2 scale-125 object-contain opacity-[0.8] blur-2xl"
        @error="awayLogoError = true" />

      <!-- Extra color/glow from the away side -->
      <div class="absolute inset-0 bg-linear-to-l from-transparent via-transparent to-black/20" />
    </div>

    <!-- ========================================================= -->
    <!-- Dark glass overlay                                         -->
    <!-- ========================================================= -->
    <div class="pointer-events-none absolute inset-0 bg-black/25" aria-hidden="true" />

    <!-- ========================================================= -->
    <!-- Content                                                    -->
    <!-- ========================================================= -->
    <div class="relative z-10 flex h-full flex-col">

      <!-- ======================================================= -->
      <!-- Header                                                  -->
      <!-- ======================================================= -->
      <div class="flex items-center justify-between gap-3">

        <!-- Venue -->
        <div class="flex min-w-0 items-center gap-2">
          <HugeiconsIcon :icon="FootballPitchIcon" :size="20" class="shrink-0 text-white/60" aria-hidden="true" />

          <span class="truncate text-[11px] font-bold uppercase tracking-[.14em] text-white/60"
            :title="fixture.venue?.name ?? 'Football'">
            {{ fixture.venue?.name ?? 'Football' }}
          </span>
        </div>

        <!-- Status -->
        <span v-if="isLive"
          class="flex shrink-0 items-center gap-1.5 rounded-full border border-error/30 bg-error/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-error">
          <span class="size-1.5 rounded-full bg-error motion-safe:animate-pulse" aria-hidden="true" />
          {{ displayStatus }}
        </span>

        <span v-else-if="isFinished"
          class="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-white/45">
          {{ displayStatus }}
        </span>

        <span v-else
          class="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/70 bg-primary/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-primary">
          <HugeiconsIcon :icon="Calendar03Icon" :size="14" aria-hidden="true" />

          SCHEDULED
        </span>
      </div>

      <!-- ======================================================= -->
      <!-- Match area                                              -->
      <!-- ======================================================= -->
      <div class="relative grid min-h-0 flex-1 grid-cols-[1fr_auto_1fr] items-center">

        <!-- ===================================================== -->
        <!-- HOME                                                  -->
        <!-- ===================================================== -->
        <div class="flex min-w-0 flex-col items-center gap-3">

          <!-- Logo -->
          <div
            class="flex size-44 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/95 p-3 shadow-[0_8px_30px_-8px_rgba(0,0,0,.6)]">
            <img v-if="fixture.home?.logo && !homeLogoError" :src="fixture.home.logo" :alt="`${fixture.home.name} logo`"
              loading="lazy" decoding="async" referrerpolicy="no-referrer" class="size-full object-contain"
              @error="homeLogoError = true" />

            <HugeiconsIcon v-else :icon="FootballIcon" :size="32" class="text-black/25" aria-hidden="true" />
          </div>

          <!-- Team name -->
          <span class="w-full truncate px-3 text-center text-sm font-black uppercase tracking-wide text-white"
            :title="fixture.home?.name">
            {{ fixture.home?.name || '—' }}
          </span>
        </div>

        <!-- ===================================================== -->
        <!-- CENTER                                                -->
        <!-- ===================================================== -->
        <div class="relative flex h-full w-32 flex-col items-center justify-center px-4">
          <!-- Left divider -->
          <span
            class="absolute left-0 top-1/2 h-20 w-px -translate-y-1/2 bg-linear-to-b from-transparent via-white/20 to-transparent"
            aria-hidden="true" />

          <!-- Right divider -->
          <span
            class="absolute right-0 top-1/2 h-20 w-px -translate-y-1/2 bg-linear-to-b from-transparent via-white/20 to-transparent"
            aria-hidden="true" />


          <!-- ================================================= -->
          <!-- SCHEDULED                                         -->
          <!-- ================================================= -->
          <template v-if="fixture.status == 'Scheduled'">
            <!-- TODAY / TOMORROW / DAY -->
            <span class="mb-2 text-[10px] font-bold uppercase tracking-[.3em] text-white/55">
              {{ matchDayLabel }}
            </span>

            <!-- DATE -->
            <p class="whitespace-nowrap text-2xl font-black uppercase tracking-tight text-white">
              {{ matchDate }}
            </p>

            <!-- TIME -->
            <span v-if="matchTime" class="mt-1 text-lg font-medium tabular-nums text-white/50">
              {{ matchTime }}
            </span>
          </template>
          <!-- ================================================= -->
          <!-- SCORE: LIVE / FINISHED                             -->
          <!-- ================================================= -->
          <template v-else>
            <span v-if="isLive" class="mb-1 text-[9px] font-bold uppercase tracking-[.25em] text-primary">
              LIVE
            </span>
            {{ fixture.status }}
            <p class="whitespace-nowrap text-4xl font-black tabular-nums tracking-tight"
              :class="isLive ? 'text-primary' : 'text-white'">
              {{ fixture.homeScore }}
              <span class="mx-1 text-white/20">–</span>
              {{ fixture.awayScore }}
            </p>

            <span v-if="isFinished" class="mt-1 text-[9px] font-bold uppercase tracking-[.2em] text-white/35">
              FULL TIME
            </span>
          </template>


        </div>

        <!-- ===================================================== -->
        <!-- AWAY                                                  -->
        <!-- ===================================================== -->
        <div class="flex min-w-0 flex-col items-center gap-3">

          <!-- Logo -->
          <div
            class="flex size-44 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/95 p-3 shadow-[0_8px_30px_-8px_rgba(0,0,0,.6)]">
            <img v-if="fixture.away?.logo && !awayLogoError" :src="fixture.away.logo" :alt="`${fixture.away.name} logo`"
              loading="lazy" decoding="async" referrerpolicy="no-referrer" class="size-full object-contain p-2"
              @error="awayLogoError = true" />

            <HugeiconsIcon v-else :icon="FootballIcon" :size="32" class="text-black/25" aria-hidden="true" />
          </div>

          <!-- Team name -->
          <span class="w-full truncate px-3 text-center text-sm font-black uppercase tracking-wide text-white"
            :title="fixture.away?.name">
            {{ fixture.away?.name || '—' }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  FootballIcon,
  Calendar03Icon,
  FootballPitchIcon,
} from '@hugeicons/core-free-icons'

export interface FixtureTeam {
  name: string
  logo?: string | null
}

export interface FixtureCardData {
  home: FixtureTeam
  away: FixtureTeam

  venue?: {
    name: string
  } | null

  startingAt?: string | null

  status: string

  homeScore?: number | null
  awayScore?: number | null
}

const props = defineProps<{
  fixture: FixtureCardData
}>()

const homeLogoError = ref(false)
const awayLogoError = ref(false)


/* ------------------------------------------------------------- */
/* Status                                                         */
/* ------------------------------------------------------------- */

const normalizedStatus = computed(() =>
  props.fixture.status?.trim().toLowerCase() ?? '',
)

const isLive = computed(() => {
  const status = normalizedStatus.value

  return (
    /\blive\b/.test(status) ||
    /\bht\b/.test(status) ||
    /\bhalf[\s-]*time\b/.test(status) ||
    /\b\d{1,3}'\b/.test(status)
  )
})

const isFinished = computed(() => {
  const status = normalizedStatus.value

  return (
    /\bft\b/.test(status) ||
    /\bfull[\s-]*time\b/.test(status) ||
    /\baet\b/.test(status) ||
    /\bpen\b/.test(status)
  )
})

/* ------------------------------------------------------------- */
/* Date                                                           */
/* ------------------------------------------------------------- */

const fixtureDate = computed(() => {
  if (!props.fixture.startingAt) return null

  const date = new Date(props.fixture.startingAt)

  return Number.isNaN(date.getTime()) ? null : date
})

const matchDate = computed(() => {
  if (!fixtureDate.value) return 'TBD'

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
  })
    .format(fixtureDate.value)
    .toUpperCase()
})

const matchTime = computed(() => {
  if (!fixtureDate.value) return ''

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(fixtureDate.value)
})

const matchDayLabel = computed(() => {
  if (!fixtureDate.value) return 'SCHEDULED'

  const now = new Date()

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )

  const matchDay = new Date(
    fixtureDate.value.getFullYear(),
    fixtureDate.value.getMonth(),
    fixtureDate.value.getDate(),
  )

  const diff = Math.round(
    (matchDay.getTime() - today.getTime()) /
    (1000 * 60 * 60 * 24),
  )

  if (diff === 0) return 'TODAY'
  if (diff === 1) return 'TOMORROW'

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
  })
    .format(fixtureDate.value)
    .toUpperCase()
})

/* ------------------------------------------------------------- */
/* Status label                                                   */
/* ------------------------------------------------------------- */

const displayStatus = computed(() => {
  return props.fixture.status?.trim() || 'Scheduled'
})

/* ------------------------------------------------------------- */
/* Accessibility                                                 */
/* ------------------------------------------------------------- */

const ariaLabel = computed(() => {
  const home = props.fixture.home?.name ?? 'Home'
  const away = props.fixture.away?.name ?? 'Away'



  if (fixtureDate.value) {
    return `${home} vs ${away}, ${matchDayLabel.value}, ${matchDate.value} at ${matchTime.value}`
  }

  return `${home} vs ${away}, scheduled`
})
</script>
