<template>
  <main class="relative isolate flex h-dvh flex-col overflow-hidden px-[7vw] py-[6vh]">
    <div class="screen-grain absolute inset-0 -z-10" />
    <div class="absolute right-[8vw] top-[-30vh] -z-10 h-[70vh] w-[70vh] rounded-full bg-lime-300/10 blur-[130px]" />
    <header class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <svg class="size-12 " viewBox="0 0 735 735" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <div>
          <div class="text-2xl font-black tracking-[.14em]">
            ARENA<span class="text-primary">TV</span>
          </div>

        </div>
      </div>
    </header>

    <section class="flex h-full flex-1 items-center gap-40">
      <div>
        <p class="mb-5 text-sm font-bold uppercase tracking-[.22em] text-primary">
          Private broadcast access
        </p>
        <h1 class="max-w-xl text-6xl font-black leading-[.93] tracking-[-.06em]">
          The match begins with your library.
        </h1>
        <p class="mt-7 max-w-md text-lg leading-relaxed text-white/55">
          Connect your authorised Xtream Codes account. ArenaTV never supplies channels, fixtures,
          or credentials.
        </p>
        <div class="mt-10 flex gap-8 text-sm text-white/50">
          <span>01 Secure connection</span><span>02 Your live library</span><span>03 Live football data</span>
        </div>
      </div>

      <form @submit.prevent="connect"
        class="w-full max-w-lg space-y-4 p-4 rounded-3xl glassmorphism flex flex-col items-center justify-center">
        <h2 class="text-2xl font-bold">Welcome back</h2>
        <p class="mt-2 text-sm text-white/50">Connect your IPTV service</p>

        <input id="server" v-model="host" tabindex="0" autocomplete="url" placeholder="https://provider.example:8080"
          class="input input-primary w-full" />
        <input v-model="profileName" tabindex="0" autocomplete="nickname" class="input input-primary w-full"
          placeholder="profile name (optional)" />
        <input v-model="user" tabindex="0" autocomplete="username" class="input input-primary w-full"
          placeholder="username" />
        <input v-model="pass" tabindex="0" type="password" autocomplete="current-password"
          class="input input-primary w-full" placeholder="password" />

        <label class="label flex items-center justify-between px-0 text-white/70">
          <span>Save this account as a profile</span>
          <input v-model="saveProfile" type="checkbox" class="checkbox checkbox-primary" />
        </label>

        <p v-if="error" class="mt-5 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-200">
          {{ error }}
        </p>

        <button tabindex="0" :disabled="isLoading" class="btn btn-primary btn-block">
          {{ isLoading ? 'CONNECTING' : 'CONNECT' }}
        </button>
      </form>
    </section>

    <footer class="text-xs uppercase tracking-[.16em] text-white/30">
      Use ↑ ↓ ← → to navigate · OK to select · Back to return
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useXtream } from '@/composables/useXtream'
import { useSpatialNav } from '@/composables/useSpatialNav'

const router = useRouter()
const { login, isLoading, error, serverUrl, username } = useXtream()
const host = ref(serverUrl.value)
const profileName = ref('')
const user = ref(username.value)
const pass = ref('')
const saveProfile = ref(true)

useSpatialNav({ defaultFocusSelector: '#server' })

async function connect() {
  if (!host.value || !user.value || !pass.value) return

  const ok = await login(host.value, user.value, pass.value, saveProfile.value ? profileName.value || user.value : undefined)
  if (ok) router.push('/home')
}
</script>
