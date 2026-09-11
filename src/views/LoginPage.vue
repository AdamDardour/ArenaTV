<template>
  <main class="relative isolate min-h-screen overflow-hidden bg-[#080a08] px-[7vw] py-[6vh] flex flex-col">
    <div class="screen-grain absolute inset-0 -z-10" />
    <div class="absolute top-[-30vh] right-[8vw] h-[70vh] w-[70vh] rounded-full bg-lime-300/10 blur-[130px] -z-10" />
    <header class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <img src="/logo.png" alt="ArenaTV logo" class="w-12" />
        <div>
          <div class="text-2xl font-black tracking-[.14em]">
            ARENA<span class="text-primary">TV</span>
          </div>
          <p class="text-xs uppercase tracking-[.23em] text-white/45">
            Sport, in its natural habitat
          </p>
        </div>
      </div>
    </header>
    <section class="flex gap-40 flex-1 h-full items-center">
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
      <form @submit.prevent="connect" class="border-l border-neutral pl-40 shadow-2xl space-y-4">
        <h2 class="text-2xl font-bold">Welcome back</h2>
        <p class="mt-2 text-sm text-white/50">Connect your IPTV service</p>
        <input id="server" v-model="host" tabindex="0" autocomplete="url" placeholder="https://provider.example:8080"
          class="input input-primary w-full" />
        <input v-model="user" tabindex="0" autocomplete="username" class="input input-primary w-full"
          placeholder="username" />
        <input v-model="pass" tabindex="0" type="password" autocomplete="current-password"
          class="input input-primary w-full" placeholder="password" />

        <label class="label">
          <input type="checkbox" v-model="remember" class="checkbox checkbox-primary" />
          Remember me
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
const user = ref(username.value)
const pass = ref('')
const remember = ref(true)
host.value = "http://vpns365.xyz"
user.value = "FQLZFFPT"

pass.value = "V2GWCZZ2"
useSpatialNav({ defaultFocusSelector: '#server' })

async function connect() {
  if (!host.value || !user.value || !pass.value) return
  if (await login(host.value, user.value, pass.value)) router.push('/home')
}
</script>
