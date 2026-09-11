<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profiles'
import { useXtream } from '@/composables/useXtream'
import { useSpatialNav } from '@/composables/useSpatialNav'

const router = useRouter()
const profileStore = useProfileStore()
const { switchProfile } = useXtream()
const error = ref('')

const profiles = computed(() => profileStore.profiles)

useSpatialNav({ defaultFocusSelector: 'button[data-profile-card]' })

async function selectProfile(profile: { id: string }) {
  error.value = ''
  const ok = await switchProfile(profile.id)
  if (ok) {
    router.push('/home')
  } else {
    error.value = 'This profile could not be connected. Please try again or edit the profile.'
  }
}
</script>

<template>
  <main class="relative flex min-h-screen items-center justify-center bg-[#080a08] px-[5vw] py-[4vh]">
    <div class="screen-grain absolute inset-0" />
    <section class="relative w-full max-w-7xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div class="mb-8 flex items-end justify-between gap-4">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.24em] text-primary">Profiles</p>
          <h1 class="mt-2 text-4xl font-black tracking-[-0.05em]">Choose your ArenaTV profile</h1>
        </div>
        <button tabindex="0" @click="router.push('/login')" class="btn btn-ghost text-white/70">
          + Add profile
        </button>
      </div>

      <div v-if="error" class="mb-5 rounded-2xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
        {{ error }}
      </div>

      <div class="flex flex-wrap gap-5">
        <button
          v-for="profile in profiles"
          :key="profile.id"
          data-profile-card
          tabindex="0"
          @click="selectProfile(profile)"
          class="glass group flex h-64 w-56 flex-col justify-between rounded-[1.6rem] border p-5 text-left transition"
          :class="profileStore.defaultProfileId === profile.id || profileStore.activeProfileId === profile.id ? 'border-primary/60 ring-2 ring-primary/40' : 'border-white/10'"
        >
          <div class="flex items-center justify-between">
            <span
              class="flex size-16 items-center justify-center rounded-full text-2xl font-black"
              :style="{ backgroundColor: profile.avatarColor, color: '#08110b' }"
            >
              {{ profile.avatarInitial }}
            </span>
            <span
              v-if="profileStore.defaultProfileId === profile.id"
              class="rounded-full border border-primary/40 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary"
            >
              Default
            </span>
          </div>

          <div>
            <h2 class="text-2xl font-black tracking-[-0.04em]">{{ profile.name }}</h2>
            <p class="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">{{ profile.username }}</p>
          </div>

          <div class="text-xs text-white/60">
            <p>Server: {{ profile.serverUrl.replace(/^https?:\/\//i, '') }}</p>
            <p v-if="profile.lastLoginAt" class="mt-2">Last used: {{ new Date(profile.lastLoginAt).toLocaleString() }}</p>
            <p v-else class="mt-2">Never connected</p>
          </div>
        </button>
      </div>
    </section>
  </main>
</template>
