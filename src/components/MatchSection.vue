<template>
  <section v-if="matches.length" :aria-labelledby="headingId">
    <div class="mb-4 flex items-center gap-3">
      <span class="h-2.5 w-2.5 rounded-full" :class="dotClass" />
      <h2 :id="headingId" class="text-lg font-black uppercase tracking-[.14em] text-white/70">{{ title }}</h2>
      <span class="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-bold text-white/40">
        {{ matches.length }}
      </span>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <MatchCard v-for="fixture in matches" :key="fixture.id" :fixture="fixture" />
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, useId } from 'vue'
import MatchCard from '@/components/MatchCard.vue'
import type { SportMonksFixture } from '@/types/sportmonks'

const props = defineProps<{
  title: string
  matches: SportMonksFixture[]
  accent?: 'live' | 'upcoming' | 'finished'
}>()

const headingId = useId()
const dotClass = computed(() => {
  if (props.accent === 'live') return 'bg-error motion-safe:animate-pulse'
  if (props.accent === 'finished') return 'bg-white/25'
  return 'bg-primary'
})
</script>
