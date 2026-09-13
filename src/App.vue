<template>
  <div class="blur-blob fixed bottom-5 right-2/3 bg-primary opacity-50 w-lg h-128 " />
  <div class="blur-blob fixed bottom-10 right-1/2 bg-accent opacity-50 w-lg h-128 " />
  <div class="blur-blob fixed bottom-40 right-1/3 bg-secondary opacity-50 w-lg h-128 " />
  <div class="drawer lg:drawer-open overflow-hidden">
    <input id="my-drawer-4" type="checkbox" class="drawer-toggle inline" />
    <div class="drawer-content h-dvh overflow-hidden">

      <div class="p-4 ">
        <div class=" " v-if="isInitialized">
          <RouterView />
        </div>

        <div v-else class="h-dvh overflow-hidden bg-base-200 text-sm text-white/50">
          CONNECTING…
        </div>
      </div>
    </div>

    <div class="drawer-side is-drawer-close:overflow-visible">
      <label for="my-drawer-4" aria-label="close sidebar" class="drawer-overlay"></label>
      <div class="flex min-h-full flex-col items-start bg-base-200/10 backdrop-blur-lg is-drawer-close:w-22 is-drawer-open:w-64">
        <!-- Sidebar content here -->
        <ul class="menu w-full grow space-y-4 menu-sm">
          <!-- List item -->
          <!-- <li>
            <label for="my-drawer-4" aria-label="open sidebar" class="btn btn-square btn-ghost drawer-button">

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round"
                stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-6">
                <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                <path d="M9 4v16"></path>
                <path d="M14 10l2 2l-2 2"></path>
              </svg>
            </label>
          </li> -->
          <li class="my-8 mb-24 ">

            <label tabindex="0" for="my-drawer-4" aria-label="open sidebar">
              <svg class="size-12 is-drawer-close:size-12" viewBox="0 0 735 735" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_i_11_25)">
                  <path
                    d="M40 433C40 309.5 40 247.733 78.383 209.383C116.766 171.033 178.5 171 302 171H433C556.5 171 618.267 171 656.617 209.383C694.967 247.766 695 309.5 695 433C695 556.5 695 618.267 656.617 656.617C618.234 694.967 556.5 695 433 695H302C178.5 695 116.733 695 78.383 656.617C40.0327 618.234 40 556.5 40 433Z"
                    stroke="white" stroke-width="80" stroke-linecap="round" />
                  <path d="M269.25 72.75L367.5 171L498.5 40" stroke="white" stroke-width="80" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <g filter="url(#filter1_i_11_25)">
                    <rect x="218" y="301" width="55" height="116" rx="27.5" fill="white" />
                  </g>
                  <g filter="url(#filter2_i_11_25)">
                    <rect x="470" y="301" width="55" height="116" rx="27.5" fill="white" />
                  </g>
                </g>
                <defs>
                  <filter id="filter0_i_11_25" x="0" y="0" width="735" height="739" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_11_25" />
                  </filter>
                  <filter id="filter1_i_11_25" x="218" y="301" width="55" height="120" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_11_25" />
                  </filter>
                  <filter id="filter2_i_11_25" x="470" y="301" width="55" height="120" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_11_25" />
                  </filter>
                </defs>
              </svg>


              <span class="is-drawer-close:hidden">Arena TV</span>
            </label>
          </li>
          <li>
            <button
              class=" p-0 is-drawer-close:tooltip is-drawer-close:tooltip-right  hover:bg-linear-to-b from-primary via-accent to-secondary w-16 h-16 rounded-3xl flex items-center justify-center"
              :class="route.name == 'home' ? 'bg-linear-to-b from-primary via-accent to-secondary text-white ' : 'text-base-content'"
              data-tip="Homepage" @click="router.push('/home')">
              <!-- Home icon -->
              <HugeiconsIcon :icon="Home04Icon" :size="36" color="currentColor" />
              <span class="is-drawer-close:hidden">Homepage</span>
            </button>
          </li>
          <li>
            <button class="is-drawer-close:tooltip is-drawer-close:tooltip-right hover:text-primary "
              data-tip="Channels" @click="router.push('/channels')">
              <!-- Channels icon -->
              <HugeiconsIcon :icon="Tv01Icon" :size="42" color="currentColor" />
              <span class="is-drawer-close:hidden">Channels</span>
            </button>
          </li>
          <li>
            <button class="is-drawer-close:tooltip is-drawer-close:tooltip-right hover:text-primary " data-tip="Search"
              @click="router.push('/search')">
              <!-- Search icon -->
              <HugeiconsIcon :icon="Search01Icon" :size="42" color="currentColor" />
              <span class="is-drawer-close:hidden">Search</span>
            </button>
          </li>
          <li>
            <button class="is-drawer-close:tooltip is-drawer-close:tooltip-right hover:text-primary "
              data-tip="Settings" @click="router.push('/settings')">
              <!-- Settings icon -->
              <HugeiconsIcon :icon="Settings02Icon" :size="42" color="currentColor" />
              <span class="is-drawer-close:hidden">Settings</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>

</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { App as CapacitorApp } from '@capacitor/app'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useXtream } from '@/composables/useXtream'
import { useProfileStore } from '@/stores/profiles'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Home04Icon, Search01Icon, Settings02Icon, Tv01Icon } from '@hugeicons/core-free-icons'

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const { isInitialized, reauthenticate, isAuthenticated } = useXtream()
let appStateListener: { remove: () => Promise<void> } | null = null

onMounted(async () => {
  const xtream = useXtream()
  await xtream.initializeSession()

  const routeName = String(route.name ?? '')
  const hasProfiles = profileStore.profiles.length > 0

  if (routeName === 'login') {
    if (profileStore.defaultProfileId && isAuthenticated.value) router.replace('/home')
    else if (!profileStore.defaultProfileId && hasProfiles && profileStore.profiles.length > 1)
      router.replace('/profiles')
    return
  }

  if (!hasProfiles) {
    router.replace('/login')
    return
  }

  if (!profileStore.defaultProfileId && profileStore.profiles.length > 1) {
    router.replace('/profiles')
    return
  }

  if (profileStore.defaultProfileId && !isAuthenticated.value && routeName !== 'settings') {
    router.replace('/login')
  }

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
<style scoped>
.bgImage {
  background-image: url('/bg1.jpg');
  background-size: cover;
  background-repeat: no-repeat;

  background-position: center;
}

.blur-blob {
  filter: blur(60px);
  transition-duration: 2s;
  transition-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
  border-radius: 9999px;
  z-index: -10;
}
</style>
