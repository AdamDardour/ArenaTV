<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    message?: string
    actionLabel?: string
  }>(),
  {
    title: 'Unable to continue',
    message: 'Something went wrong.',
    actionLabel: 'Try again',
  },
)

defineEmits<{ close: []; action: [] }>()
</script>

<template>
  <div class="fixed inset-0 z-50 grid place-items-center bg-black/70 px-6">
    <div class="glass w-full max-w-lg rounded-[1.5rem] border border-white/10 p-6 text-center">
      <p class="text-xs font-black uppercase tracking-[0.24em] text-red-300">Error</p>
      <h2 class="mt-4 text-3xl font-black tracking-[-0.05em]">{{ title }}</h2>
      <p class="mt-3 text-white/60">{{ message }}</p>
      <div class="mt-6 flex justify-center gap-3">
        <button tabindex="0" @click="$emit('action')" class="btn btn-primary">{{ actionLabel }}</button>
        <button tabindex="0" @click="$emit('close')" class="btn btn-ghost">Close</button>
      </div>
    </div>
  </div>
</template>
