<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useXtream } from '@/composables/useXtream'
import { useProfileStore } from '@/stores/profiles'

const router = useRouter()
const profileStore = useProfileStore()
const { logout, refreshChannels, isRefreshing } = useXtream()
const refreshMessage = ref('')

const activeProfile = computed(
  () => profileStore.activeProfile ?? profileStore.defaultProfile ?? profileStore.profiles[0] ?? null,
)

async function refreshLibrary() {
  refreshMessage.value = 'Refreshing library…'
  const result = await refreshChannels()
  refreshMessage.value = `Updated ${result.channelsFound} channels · ${result.newCount} new · ${result.updatedCount} updated`
}

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <main class="tv-safe min-h-screen bg-[#080a08] py-10 text-white">
    <div class="mx-auto max-w-5xl space-y-6">


      <section class="glass grid gap-4 rounded-[1.5rem] border border-white/10 p-5 md:grid-cols-2">
        <div class="rounded-2xl border border-white/10 bg-white/3 p-4">
          <p class="text-xs font-black uppercase tracking-[0.18em] text-white/40">Profiles</p>
          <h2 class="mt-3 text-2xl font-black">{{ activeProfile ? activeProfile.name : 'No profile selected' }}</h2>
          <p class="mt-2 text-sm text-white/60">{{ activeProfile
            ? activeProfile.serverUrl
            : 'Create a profile to connect to your server.' }}</p>
          <button tabindex="0" @click="router.push('/settings/profiles')" class="btn btn-primary mt-4">Manage
            profiles</button>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/3 p-4">
          <p class="text-xs font-black uppercase tracking-[0.18em] text-white/40">IPTV Library</p>
          <h2 class="mt-3 text-2xl font-black">Refresh channels</h2>
          <p class="mt-2 text-sm text-white/60">{{ refreshMessage || 'Sync the live catalogue with your provider.' }}
          </p>
          <button tabindex="0" :disabled="isRefreshing" @click="refreshLibrary" class="btn btn-primary mt-4">
            {{ isRefreshing ? 'Updating…' : 'Update channels' }}
          </button>
        </div>
      </section>

      <section class="glass rounded-[1.5rem] border border-white/10 p-5">
        <p class="text-xs font-black uppercase tracking-[0.18em] text-white/40">Account</p>
        <div class="mt-4 flex flex-wrap gap-3">
          <button tabindex="0" @click="router.push('/home')" class="btn btn-ghost">Back home</button>
          <button tabindex="0" @click="handleLogout" class="btn btn-error">Logout</button>
        </div>
      </section>

      <section class="glass rounded-[1.5rem] border border-white/10 p-5">
        <p class="text-xs font-black uppercase tracking-[0.18em] text-white/40">About</p>
        <div class="mt-3 text-sm text-white/70">
          <p>ArenaTV Android TV</p>
          <p class="mt-1">Version 1.0.0</p>
        </div>
      </section>
    </div>
  </main>
</template>
