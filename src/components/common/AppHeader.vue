<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useXtream } from '@/composables/useXtream'

const route = useRoute()
const router = useRouter()
const { liveStreams } = useXtream()

const links = [
  { label: 'HOME', name: 'home' },
  { label: 'LIVE TV', name: 'channels' },
]
</script>

<template>
  <header
    class="navbar sticky top-0 z-30 min-h-0 border-b border-white/10 bg-[#080a08]/10 px-[5vw] py-4 backdrop-blur-xl">
    <div class="navbar-start gap-6">
      <button tabindex="0" @click="router.push('/home')" class="btn btn-ghost ">
        <img src="/logo.png" alt="ArenaTV" class="w-12" />
        <span class="ml-2">ArenaTV</span>
      </button>
      <nav class="hidden gap-1 sm:flex" aria-label="Primary navigation">
        <button v-for="link in links" :key="link.name" tabindex="0" @click="router.push({ name: link.name })"
          class="btn btn-sm border-0 font-bold" :class="route.name === link.name
            ? 'bg-white/10 text-white hover:bg-white/15'
            : 'btn-ghost text-white/45 hover:bg-white/8 hover:text-white'
            ">
          {{ link.label }}
        </button>
      </nav>
    </div>
    <div class="navbar-end">
      <div class="hidden items-center gap-3 text-xs font-bold uppercase tracking-[.14em] sm:flex">
        <span class="size-2 rounded-full bg-primary shadow-[0_0_12px_#00B783]" />
        Library connected
        <span class="badge badge-ghost border-white/10 text-white/45">{{ liveStreams.length }} channels</span>
      </div>
      <div class="dropdown dropdown-end sm:hidden">
        <button tabindex="0" class="btn btn-ghost btn-square btn-sm" aria-label="Open navigation">
          ☰
        </button>
        <ul tabindex="0"
          class="menu dropdown-content z-40 mt-3 w-48 rounded-box border border-white/10 bg-[#11140f] p-2 shadow-2xl">
          <li v-for="link in links" :key="link.name">
            <button @click="router.push({ name: link.name })" :class="{ active: route.name === link.name }">
              {{ link.label }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>
