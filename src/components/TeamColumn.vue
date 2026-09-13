<template>
  <div class="flex min-w-0 max-w-[13rem] flex-col items-center gap-3">
    <span class="flex size-20 items-center justify-center overflow-hidden rounded-2xl bg-white/10 sm:size-24">
      <img v-if="participant?.image_path" :src="participant.image_path" :alt="''" loading="lazy" decoding="async"
        referrerpolicy="no-referrer" class="size-full object-contain p-3"
        @error="($event.target as HTMLImageElement).style.display = 'none'" />
      <HugeiconsIcon v-else :icon="FootballIcon" :size="30" class="text-white/30" />
    </span>
    <span class="truncate text-lg font-black sm:text-xl">{{ participant?.name ?? '—' }}</span>
  </div>
</template>
<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { FootballIcon } from '@hugeicons/core-free-icons'
import type { SportMonksParticipant } from '@/types/sportmonks'

defineProps<{ participant: SportMonksParticipant | null }>()
</script>
