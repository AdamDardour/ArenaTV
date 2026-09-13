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
  <main class="h-dvh  py-8 text-white">
    <div class=" space-y-6">
      <section class=" grid gap-4  md:grid-cols-2">
        <div class="glassmorphism rounded-3xl p-4">
          <p class="text-xs font-black uppercase tracking-[0.18em] text-white/40">Profiles</p>
          <h2 class="mt-3 text-2xl font-black">{{ activeProfile ? activeProfile.name : 'No profile selected' }}</h2>
          <p class="mt-2 text-sm text-white/60">{{ activeProfile
            ? activeProfile.serverUrl
            : 'Create a profile to connect to your server.' }}</p>
          <button tabindex="0" @click="router.push('/settings/profiles')" class="btn btn-primary mt-4">Manage
            profiles</button>
        </div>

        <div class="glassmorphism rounded-3xl p-4">

          <h2 class="mt-3 text-2xl font-black">Refresh channels</h2>
          <p class="mt-2 text-sm text-white/60">{{ refreshMessage || 'Sync the live catalogue with your provider.' }}
          </p>
          <button tabindex="0" :disabled="isRefreshing" @click="refreshLibrary" class="btn btn-primary mt-4">
            {{ isRefreshing ? 'Updating…' : 'Update channels' }}
          </button>
        </div>
      </section>


      <section class="glassmorphism rounded-3xl   p-5">


        <button tabindex="0" @click="handleLogout" class="btn btn-error btn-lg rounded-2xl">Logout</button>


        <div class="mt-3 text-sm text-white/70">
          <p>ArenaTV Android TV</p>
          <p class="mt-1">Version 1.0.0</p>
        </div>
      </section>
    </div>
  </main>
</template>
