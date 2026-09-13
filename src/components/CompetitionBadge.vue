<template>
  <span
    class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-3 py-1 text-[11px] font-bold uppercase tracking-[.14em] text-white/55">
    <span class="flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
      <img v-if="league?.image_path" :src="league.image_path" :alt="''" loading="lazy" decoding="async"
        referrerpolicy="no-referrer" class="size-full object-contain"
        @error="($event.target as HTMLImageElement).style.display = 'none'" />
      <HugeiconsIcon v-else :icon="FootballIcon" :size="11" />
    </span>
    <span class="truncate">{{ league?.name ?? 'Football' }}</span>
  </span>
</template>
<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { FootballIcon } from '@hugeicons/core-free-icons'
import type { SportMonksLeague } from '@/types/sportmonks'

defineProps<{ league?: SportMonksLeague | null }>()
</script>
