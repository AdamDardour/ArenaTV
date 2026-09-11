<script setup lang="ts">
defineEmits<{ retry: []; switchProfile: []; loginAgain: [] }>()
</script>

<template>
  <div class="fixed inset-0 z-50 grid place-items-center bg-black/70 px-6">
    <div class="glass w-full max-w-xl rounded-[1.6rem] border border-white/10 p-6 text-center">
      <p class="text-xs font-black uppercase tracking-[0.24em] text-primary">Session expired</p>
      <h2 class="mt-4 text-3xl font-black tracking-[-0.05em]">Your IPTV session could not be reconnected.</h2>
      <div class="mt-6 flex justify-center gap-3">
        <button tabindex="0" @click="$emit('retry')" class="btn btn-primary">Retry</button>
        <button tabindex="0" @click="$emit('switchProfile')" class="btn btn-ghost">Switch profile</button>
        <button tabindex="0" @click="$emit('loginAgain')" class="btn btn-ghost">Login again</button>
      </div>
    </div>
  </div>
</template>
