<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    summary?: string
    channelsFound?: number
    newCount?: number
    removedCount?: number
    updatedCount?: number
    loading?: boolean
  }>(),
  {
    title: 'Updating your IPTV library…',
    summary: 'Checking your provider for the latest channels and categories.',
    channelsFound: 0,
    newCount: 0,
    removedCount: 0,
    updatedCount: 0,
    loading: false,
  },
)
</script>

<template>
  <div class="fixed inset-0 z-50 grid place-items-center bg-black/70 px-6">
    <div class="glass w-full max-w-xl rounded-[1.5rem] border border-white/10 p-6 text-center">
      <p class="text-xs font-black uppercase tracking-[0.22em] text-primary">Refresh</p>
      <h2 class="mt-4 text-3xl font-black tracking-[-0.05em]">{{ title }}</h2>
      <p v-if="loading" class="mt-3 text-white/60">{{ summary }}</p>
      <div class="mt-6 grid gap-3 text-left sm:grid-cols-2">
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3"><strong>{{ channelsFound }}</strong><br />channels found</div>
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3"><strong>{{ newCount }}</strong><br />new channels</div>
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3"><strong>{{ updatedCount }}</strong><br />updated</div>
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3"><strong>{{ removedCount }}</strong><br />removed</div>
      </div>
    </div>
  </div>
</template>
