<template>
  <div class="drawer lg:drawer-open overflow-hidden">
    <input id="my-drawer-4" type="checkbox" class="drawer-toggle inline" />
    <div class="drawer-content h-dvh overflow-hidden">
      <div class="p-4 ">
        <div class=" " v-if="isInitialized">
          <RouterView />
        </div>

        <div v-else class="h-dvh overflow-hidden bg-[#080a08] text-sm text-white/50">
          CONNECTING…
        </div>
      </div>
    </div>

    <div class="drawer-side is-drawer-close:overflow-visible">
      <label for="my-drawer-4" aria-label="close sidebar" class="drawer-overlay"></label>
      <div class="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-22 is-drawer-open:w-64">
        <!-- Sidebar content here -->
        <ul class="menu w-full grow space-y-4 ">
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
              <svg class="size-12 is-drawer-close:size-12  " viewBox="0 0 705 705" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_i_11_25)">
                  <path
                    d="M24.5625 417.562C24.5625 294.062 24.5625 232.296 62.9455 193.945C101.328 155.595 163.062 155.562 286.562 155.562H417.562C541.063 155.562 602.829 155.562 641.179 193.945C679.53 232.328 679.562 294.062 679.562 417.562C679.562 541.063 679.562 602.829 641.179 641.179C602.796 679.53 541.063 679.562 417.562 679.562H286.562C163.062 679.562 101.296 679.562 62.9455 641.179C24.5952 602.796 24.5625 541.063 24.5625 417.562Z"
                    stroke="url(#paint0_linear_11_25)" stroke-width="49.125" stroke-linecap="round" />
                  <path d="M253.812 57.3125L352.062 155.562L483.062 24.5625" stroke="url(#paint1_linear_11_25)"
                    stroke-width="49.125" stroke-linecap="round" stroke-linejoin="round" />
                  <g filter="url(#filter1_i_11_25)">
                    <rect x="202.562" y="285.562" width="46" height="116" rx="23" fill="white" />
                  </g>
                  <g filter="url(#filter2_i_11_25)">
                    <rect x="454.562" y="285.562" width="46" height="116" rx="23" fill="white" />
                  </g>
                </g>
                <defs>
                  <filter id="filter0_i_11_25" x="0" y="0" width="704.125" height="708.125" filterUnits="userSpaceOnUse"
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
                  <filter id="filter1_i_11_25" x="202.562" y="285.562" width="46" height="120"
                    filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
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
                  <filter id="filter2_i_11_25" x="454.562" y="285.562" width="46" height="120"
                    filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
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
                  <linearGradient id="paint0_linear_11_25" x1="352.062" y1="155.562" x2="352.062" y2="679.562"
                    gradientUnits="userSpaceOnUse">
                    <stop stop-color="#00FFA6" />
                    <stop offset="0.451923" stop-color="#00C9F3" />
                    <stop offset="1" stop-color="#5C0099" />
                  </linearGradient>
                  <linearGradient id="paint1_linear_11_25" x1="368.437" y1="24.5625" x2="368.437" y2="155.562"
                    gradientUnits="userSpaceOnUse">
                    <stop stop-color="#00C9F3" />
                    <stop offset="1" stop-color="#00FFA6" />
                  </linearGradient>
                </defs>
              </svg>





              <span class="is-drawer-close:hidden">Arena TV</span>
            </label>
          </li>
          <li>
            <button class="is-drawer-close:tooltip is-drawer-close:tooltip-right hover:text-primary "
              data-tip="Homepage" @click="router.push('/home')">
              <!-- Home icon -->
              <HugeiconsIcon :icon="Home04Icon" :size="42" color="currentColor" />
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
