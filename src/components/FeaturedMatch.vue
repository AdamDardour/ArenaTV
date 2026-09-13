<template>
  <section
    class="relative overflow-hidden rounded-4xl border border-white/10 bg-white/[.045] px-10 py-10 backdrop-blur-xl sm:px-14 sm:py-12">
    <div class="pointer-events-none absolute -top-1/2 right-[8%] size-[28rem] rounded-full bg-[#c9ff4a]/10 blur-[120px]" />

    <!-- Loading -->
    <div v-if="loading" class="relative flex flex-col items-center gap-6 py-6">
      <div class="h-3 w-40 animate-pulse rounded-full bg-white/10" />
      <div class="h-16 w-full max-w-xl animate-pulse rounded-2xl bg-white/10" />
      <div class="h-3 w-28 animate-pulse rounded-full bg-white/10" />
    </div>

    <!-- No fixture -->
    <div v-else-if="!fixture" class="relative flex flex-col items-center gap-3 py-8 text-center">
      <HugeiconsIcon :icon="FootballIcon" :size="34" class="text-white/25" />
      <p class="text-lg font-bold text-white/60">No football scheduled today.</p>
      <p class="text-sm text-white/35">Check back tomorrow, or once fixtures are announced.</p>
    </div>

    <!-- Featured fixture -->
    <div v-else class="relative flex flex-col items-center gap-5 text-center">
      <div class="flex items-center gap-2 text-xs font-black uppercase tracking-[.24em] text-[#c9ff4a]">
        <HugeiconsIcon :icon="StarIcon" :size="14" />
        Featured match
      </div>

      <div class="flex w-full max-w-4xl items-center justify-center gap-6 sm:gap-12">
        <TeamColumn :participant="participants.home" />
        <div class="flex shrink-0 flex-col items-center gap-2">
          <p class="text-6xl font-black tabular-nums tracking-tight sm:text-8xl">
            <template v-if="score">{{ score.home }} <span class="text-white/25">—</span> {{ score.away }}</template>
            <template v-else>{{ kickoffTime }}</template>
          </p>
        </div>
        <TeamColumn :participant="participants.away" />
      </div>

      <div class="flex flex-col items-center gap-2">
        <span v-if="kind === 'live'"
          class="flex items-center gap-2 rounded-full bg-error/15 px-4 py-1.5 text-sm font-black tracking-wider text-error">
          <span class="size-2 rounded-full bg-error motion-safe:animate-pulse" />
          LIVE {{ minuteLabel }}
        </span>
        <span v-else-if="kind === 'finished'" class="text-sm font-black tracking-wider text-white/45">
          FULL TIME
        </span>
        <span v-else class="text-sm font-black tracking-wider text-primary">
          STARTS IN {{ countdownLabel }}
        </span>
        <CompetitionBadge :league="fixture.league" />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import { FootballIcon, StarIcon } from '@hugeicons/core-free-icons'
import CompetitionBadge from '@/components/CompetitionBadge.vue'
import TeamColumn from '@/components/TeamColumn.vue'
import {
  formatCountdown,
  formatKickoffTime,
  getCountdown,
  getLiveMinute,
  getMatchKind,
  getParticipants,
  getScore,
} from '@/utils/matchStatus'
import type { SportMonksFixture } from '@/types/sportmonks'

const props = defineProps<{ fixture: SportMonksFixture | null; loading?: boolean }>()

const kind = computed(() => (props.fixture ? getMatchKind(props.fixture) : 'upcoming'))
const participants = computed(() =>
  props.fixture ? getParticipants(props.fixture) : { home: null, away: null },
)
const score = computed(() => (props.fixture ? getScore(props.fixture) : null))
const minuteLabel = computed(() => (props.fixture ? getLiveMinute(props.fixture) : null))
const kickoffTime = computed(() => (props.fixture ? formatKickoffTime(props.fixture) : ''))

const now = ref(new Date())
let ticker: number | undefined
onMounted(() => {
  ticker = window.setInterval(() => (now.value = new Date()), 1000)
})
onBeforeUnmount(() => window.clearInterval(ticker))
const countdownLabel = computed(() =>
  props.fixture ? formatCountdown(getCountdown(props.fixture, now.value)) : '',
)
</script>
