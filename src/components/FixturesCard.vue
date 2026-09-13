<template>
  <article tabindex="0" :aria-label="ariaLabel"
    class="hover:scale-95 group relative flex w-72 flex-col justify-center  overflow-hidden rounded-3xl border border-white/10 bg-white/4.5 p-5 shadow-[0_1px_0_0_rgba(255,255,255,.04)_inset] backdrop-blur-xl transition duration-200 focus:outline-none focus-visible:-translate-y-0.5 focus-visible:border-primary/50 focus-visible:bg-white/9 focus-visible:shadow-[0_10px_34px_-10px_rgba(201,255,74,.3)]">
    <!-- hairline sheen, glow blob: consistent with the rest of the app's glass surfaces -->
    <span
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />
    <span class="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full blur-[60px]"
      :class="isLive ? 'bg-error/20' : 'bg-[#c9ff4a]/10'" />

    <!-- <div class="relative mb-2 flex items-center justify-center gap-2">

      <span v-if="isLive"
        class="flex shrink-0 items-center gap-1.5 rounded-full bg-error/15 px-2.5 py-1 text-[11px] font-black tracking-wider text-error">
        <span class="size-1.5 rounded-full bg-error motion-safe:animate-pulse" />
        {{ fixture.status }}
      </span>
      <span v-else-if="isFinished"
        class="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-black tracking-wider text-white/45">
        {{ fixture.status }}
      </span>
      <span v-else
        class="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-black tracking-wider text-primary">
        {{ fixture.status }}
      </span>
    </div> -->

    <div class="relative grid grid-cols-3 items-center gap-2 py-2">
      <div class="flex min-w-0 flex-col items-center gap-2">
        <span
          class="flex size-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/95 p-2.5 shadow-[0_4px_16px_-4px_rgba(0,0,0,.4)]">
          <img v-if="fixture.home?.logo" :src="fixture.home.logo" :alt="''" loading="lazy" decoding="async"
            referrerpolicy="no-referrer" class="size-full object-contain"
            @error="($event.target as HTMLImageElement).style.display = 'none'" />
          <HugeiconsIcon v-else :icon="FootballIcon" :size="20" class="text-black/30" />
        </span>
        <span class="w-full truncate text-center text-xs font-bold text-white">{{ fixture.home?.name || '—' }}</span>
      </div>

      <div class="flex flex-col items-center gap-1 px-1 justify-start  text-center h-full">

        <div v-if="fixture.status == 'Scheduled'">
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
        </div>
        <div v-else class="text-3xl font-black flex flex-col  items-center justify-center gap-2 h-full ">
          <div class="badge glassmorphism badge-lg rounded-full">
            {{ fixture.homeScore }}<span class="text-white font-bold">
              -
            </span>{{ fixture.awayScore }}
          </div>
          <span v-if="isLive"
            class="flex shrink-0 items-center gap-1.5 rounded-full bg-error/15 px-2.5 py-1 text-[11px] font-black tracking-wider text-error">
            <span class="size-1.5 rounded-full bg-error motion-safe:animate-pulse" />
            {{ fixture.status }}
          </span>
          <span v-else-if="isFinished"
            class="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-black tracking-wider text-white/45">
            {{ fixture.status }}
          </span>
          <span v-else
            class="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-black tracking-wider text-primary">
            {{ fixture.status }}
          </span>

        </div>

      </div>

      <div class="flex min-w-0 flex-col items-center gap-2">
        <span
          class="flex size-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/95 p-2.5 shadow-[0_4px_16px_-4px_rgba(0,0,0,.4)]">
          <img v-if="fixture.away?.logo" :src="fixture.away.logo" :alt="''" loading="lazy" decoding="async"
            referrerpolicy="no-referrer" class="size-full object-contain"
            @error="($event.target as HTMLImageElement).style.display = 'none'" />
          <HugeiconsIcon v-else :icon="FootballIcon" :size="20" class="text-black/30" />
        </span>
        <span class="w-full truncate text-center text-xs font-bold text-white">{{ fixture.away?.name || '—' }}</span>
      </div>
    </div>
    <span class="truncate text-center  text-[11px] font-bold uppercase tracking-[.14em] text-white/40">
      {{ fixture.venue?.name ?? 'Football' }}
    </span>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import { FootballIcon } from '@hugeicons/core-free-icons'

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

const props = defineProps<{ fixture: FixtureCardData }>()

const hasScore = computed(
  () => props.fixture.homeScore != null && props.fixture.awayScore != null,
)
// `status` here is a free-text string rather than a state enum, so the
// live/finished/upcoming split is inferred from its content. If your data
// source already exposes a proper status enum, swap this for a direct
// comparison instead of pattern-matching text.
const isLive = computed(() => /live|'|HT\b/i.test(props.fixture.status))
const isFinished = computed(() => /^(FT|AET|PEN)\b/i.test(props.fixture.status))
const ariaLabel = computed(
  () => `${props.fixture.home?.name ?? 'Home'} vs ${props.fixture.away?.name ?? 'Away'}, ${props.fixture.status}`,
)


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
</script>
