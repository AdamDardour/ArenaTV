<template>
  <Transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="glassmorphism w-[min(680px,calc(100vw-2rem))] rounded-3xl border border-white/15 p-4 shadow-2xl">
        <div class="mb-3 flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <HugeiconsIcon :icon="Search01Icon" :size="28" class="text-primary" />
            <span class="text-xs font-black uppercase tracking-[.18em] text-white/60">Search channels</span>
          </div>
          <button tabindex="0" @click="closeSearch" class="btn btn-ghost btn-circle btn-sm" aria-label="Close search">
            <HugeiconsIcon :icon="Cancel01Icon" :size="20" />
          </button>
        </div>

        <label class="input input-xl w-full rounded-3xl border border-white/10 bg-black/30">
          <HugeiconsIcon :icon="Search01Icon" :size="30" class="text-white/65" />
          <input id="channel-search" type="search" class="grow text-white placeholder:text-white/40"
            placeholder="Search channels" :value="modelValue" @input="onQueryInput($event)"
            @keydown.escape="closeSearch" />
        </label>

        <div class="mt-4 flex items-center justify-end gap-2">
          <button tabindex="0" @click="clearSearch" class="btn btn-ghost btn-sm text-white/70">CLEAR</button>
          <button tabindex="0" @click="closeSearch" class="btn btn-primary btn-sm">CLOSE</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

const props = defineProps<{
  open: boolean
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  close: []
}>()

const query = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

function onQueryInput(event: Event) {
  const target = event.target as HTMLInputElement
  query.value = target.value
}

function clearSearch() {
  query.value = ''
}

function closeSearch() {
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
