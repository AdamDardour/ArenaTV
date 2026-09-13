<template>
  <article tabindex="0" :aria-label="ariaLabel"
    class="group relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[.04] p-4 shadow-[0_1px_0_0_rgba(255,255,255,.04)_inset] backdrop-blur-xl transition duration-200 focus:outline-none focus-visible:-translate-y-0.5 focus-visible:border-primary/50 focus-visible:bg-white/[.09] focus-visible:shadow-[0_10px_34px_-10px_rgba(201,255,74,.3)]"
    :class="kind === 'finished' ? 'opacity-70' : ''">
    <span class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

    <div class="flex items-center justify-between gap-2">
      <CompetitionBadge :league="fixture.league" />
      <span v-if="kind === 'live'"
        class="flex items-center gap-1.5 rounded-full bg-error/15 px-2.5 py-1 text-[11px] font-black tracking-wider text-error">
        <span class="size-1.5 rounded-full bg-error motion-safe:animate-pulse" />
        {{ minuteLabel ?? 'LIVE' }}
      </span>
      <span v-else-if="kind === 'finished'"
        class="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-black tracking-wider text-white/45">
        {{ statusLabel }}
      </span>
      <span v-else class="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-black tracking-wider text-primary">
        {{ kickoffTime }}
      </span>
    </div>

    <div class="flex flex-col gap-2.5">
      <div v-for="side in ['home', 'away'] as const" :key="side" class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-2.5">
          <span class="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
            <img v-if="participants[side]?.image_path" :src="participants[side]!.image_path!" :alt="''"
              loading="lazy" decoding="async" referrerpolicy="no-referrer" class="size-full object-contain"
              @error="($event.target as HTMLImageElement).style.display = 'none'" />
            <HugeiconsIcon v-else :icon="FootballIcon" :size="14" />
          </span>
          <span class="truncate text-sm font-bold text-white">{{ participants[side]?.name ?? '—' }}</span>
        </div>
        <span v-if="score" class="text-xl font-black tabular-nums" :class="kind === 'live' ? 'text-primary' : 'text-white'">
          {{ score[side] }}
        </span>
      </div>
    </div>

    <p v-if="kind === 'upcoming'" class="text-center text-[11px] font-bold tracking-wide text-white/35">
      STARTS IN {{ countdownLabel }}
    </p>
  </article>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import { FootballIcon } from '@hugeicons/core-free-icons'
import CompetitionBadge from '@/components/CompetitionBadge.vue'
import {
  formatCountdown,
  formatKickoffTime,
  getCountdown,
  getLiveMinute,
  getMatchKind,
  getParticipants,
  getScore,
  getStatusLabel,
} from '@/utils/matchStatus'
import type { SportMonksFixture } from '@/types/sportmonks'

const props = defineProps<{ fixture: SportMonksFixture }>()

const kind = computed(() => getMatchKind(props.fixture))
const participants = computed(() => getParticipants(props.fixture))
const score = computed(() => getScore(props.fixture))
const minuteLabel = computed(() => getLiveMinute(props.fixture))
const statusLabel = computed(() => getStatusLabel(props.fixture))
const kickoffTime = computed(() => formatKickoffTime(props.fixture))
const ariaLabel = computed(() => {
  const { home, away } = participants.value
  return `${home?.name ?? 'Home'} vs ${away?.name ?? 'Away'}, ${statusLabel.value}`
})

// Only the upcoming-match countdown needs a per-second re-render; live
// minute and score come from polled data via props, so no separate ticker
// is needed for those.
const now = ref(new Date())
let ticker: number | undefined
onMounted(() => {
  if (kind.value === 'upcoming') ticker = window.setInterval(() => (now.value = new Date()), 1000)
})
onBeforeUnmount(() => window.clearInterval(ticker))
const countdownLabel = computed(() => formatCountdown(getCountdown(props.fixture, now.value)))
</script>
