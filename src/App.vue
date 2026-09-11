<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { App as CapacitorApp } from '@capacitor/app'
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import { useXtream } from '@/composables/useXtream'

const route = useRoute()
const router = useRouter()
const { isInitialized, reauthenticate } = useXtream()
let appStateListener: { remove: () => Promise<void> } | null = null

onMounted(async () => {
  await useXtream().initializeSession()
  appStateListener = await CapacitorApp.addListener('appStateChange', ({ isActive }) => {
    if (isActive)
      void reauthenticate().then((authenticated) => {
        if (!authenticated && route.name !== 'login') router.replace('/login')
      })
  })
})

onBeforeUnmount(() => {
  void appStateListener?.remove()
})
</script>

<template>
  <RouterView v-if="route.name === 'login'" />
  <div v-else-if="isInitialized" class="flex h-full flex-col overflow-hidden bg-[#080a08] ">
    <AppHeader />
    <div class="min-h-0 flex-1">
      <RouterView />
    </div>
  </div>
  <div v-else class="grid h-screen place-items-center bg-[#080a08] text-sm text-white/50">
    CONNECTING…
  </div>
</template>
