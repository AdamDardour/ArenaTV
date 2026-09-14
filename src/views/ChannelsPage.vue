<template>
  <SearchModal :open="showSearchModal" :model-value="query" @update:model-value="query = $event"
    @close="showSearchModal = false" />

  <main class="relative h-full grid grid-cols-8 font-dm-sans ">
    <div class="screen-grain pointer-events-none fixed inset-0" />
    <div class="lime-grid pointer-events-none fixed inset-0 opacity-[.14]" />

    <!-- Channel categories -->
    <div class="relative col-span-2 flex flex-col gap-2 h-dvh overflow-y-auto px-3 py-8 pb-16"
      aria-label="Channel categories">
      <div tabindex="0"
        class="my-2 cursor-pointer rounded-xl  sticky top-0 z-50 text-left text-sm backdrop-blur-xl transition-all duration-300 ease-out focus:outline-none focus-visible:-translate-y-0.5 focus-visible:shadow-[0_10px_34px_-10px_rgba(201,255,74,.3)]">
        <label class="input input-primary input-ghost w-full ">
          <HugeiconsIcon :icon="Search01Icon" :size="24" class="text-white/65" />
          <input id="channel-search" type="search" class="grow text-white placeholder:text-white/40"
            placeholder="Search channels" v-model="query" />
        </label>
      </div>


      <button tabindex="0" @click="selectedCategory = null"
        class="cursor-pointer rounded-xl border px-4 py-3 text-left text-sm backdrop-blur-xl transition-all duration-300 ease-out focus:outline-none focus-visible:-translate-y-0.5 focus-visible:shadow-[0_10px_34px_-10px_rgba(201,255,74,.3)]"
        :class="selectedCategory === null
          ? 'border-primary/40 bg-primary/90 font-black text-primary-content shadow-[0_10px_30px_-10px_rgba(201,255,74,.45)]'
          : 'border-white/10 bg-white/4 text-white/55 hover:border-white/20 hover:bg-white/[.07] hover:text-white focus-visible:border-primary/50 focus-visible:bg-white/9'">
        ALL
        <span class="badge badge-sm border-0 ml-2"
          :class="selectedCategory === null ? 'bg-black/15 text-primary-content' : 'bg-black/25 text-white/45'">
          {{ liveStreams.length }}
        </span>
      </button>

      <button v-for="category in availableCategories" :key="category.id" tabindex="0"
        @click="selectedCategory = selectedCategory === category.id ? null : category.id"
        class="group relative cursor-pointer rounded-xl border px-4 py-3 text-left text-sm backdrop-blur-xl transition-all duration-300 ease-out focus:outline-none focus-visible:-translate-y-0.5 focus-visible:shadow-[0_10px_34px_-10px_rgba(201,255,74,.3)]"
        :class="selectedCategory === category.id
          ? 'border-primary/40 bg-primary/90 font-black text-primary-content shadow-[0_10px_30px_-10px_rgba(201,255,74,.45)]'
          : 'border-white/10 bg-white/4 text-white/55 hover:border-white/20 hover:bg-white/[.07] hover:text-white focus-visible:border-primary/50 focus-visible:bg-white/9'">
        <span
          class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {{ category.name }}
      </button>
    </div>

    <!-- Channel list -->
    <div class="relative col-span-2 h-dvh overflow-y-auto px-3 py-8 pb-16">
      <div v-if="nativePlaybackError" role="alert"
        class="alert alert-error mb-5 border border-error/30 bg-error/10 text-sm backdrop-blur-md">
        <HugeiconsIcon :icon="Alert01Icon" :size="18" />
        <span>{{ nativePlaybackError }}</span>
        <button tabindex="0" @click="nativePlaybackError = ''" class="btn btn-ghost btn-xs">DISMISS</button>
      </div>

      <template v-if="channelGroups.length">
        <p class="mb-4 text-[11px] font-bold uppercase tracking-[.16em] text-white/35">
          {{ visibleChannelCount }} channels
        </p>
        <TransitionGroup name="rise" tag="div" class="space-y-8">
          <section v-for="group in visibleGroups" :key="group.id" :aria-labelledby="`category-${group.id}`">
            <div class="mb-4 flex items-center gap-3">
              <span class="h-px w-8 bg-primary" />
              <h2 :id="`category-${group.id}`" class="text-lg font-black tracking-[-.02em]">{{ group.name }}</h2>
              <span class="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-bold text-white/40">{{
                group.streams.length }}</span>
            </div>
            <div class="flex flex-col gap-2">
              <article v-for="stream in group.streams" :key="String(stream.stream_id)" tabindex="0"
                @click="play(stream)" @keydown.enter="play(stream)"
                class="group relative flex min-w-0 cursor-pointer items-center justify-between gap-4 overflow-hidden rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/8 hover:shadow-[0_8px_26px_-10px_rgba(201,255,74,.3)] focus:outline-none focus-visible:-translate-y-0.5 focus-visible:border-primary/50 focus-visible:bg-white/9 focus-visible:shadow-[0_10px_34px_-10px_rgba(201,255,74,.35)]"
                :class="selectedChannel?.stream_id === stream.stream_id ? 'border-primary/50 bg-white/9' : ''">
                <span
                  class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
                <div class="relative flex min-w-0 items-center gap-3">
                  <div
                    class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/6 text-primary">
                    <img v-if="stream.stream_icon" :src="stream.stream_icon" :alt="''" loading="lazy" decoding="async"
                      referrerpolicy="no-referrer" class="size-full object-contain"
                      @error="($event.target as HTMLImageElement).style.display = 'none'" />
                    <HugeiconsIcon v-else :icon="Tv01Icon" :size="18" />
                  </div>
                  <div class="min-w-0">
                    <h3 class="truncate text-sm font-bold text-white">{{ stream.name }}</h3>
                    <p class="mt-0.5 text-[11px] font-bold uppercase tracking-[.13em] text-white/35">
                      Channel {{ stream.num ?? stream.stream_id }}
                    </p>
                  </div>
                </div>
                <HugeiconsIcon :icon="PlayIcon" :size="18"
                  class="relative shrink-0 text-white/0 transition-colors duration-300 group-hover:text-primary group-focus-visible:text-primary" />
              </article>
            </div>
          </section>
        </TransitionGroup>

        <div v-if="visibleGroups.length < channelGroups.length" ref="sentinel" class="flex justify-center py-6">
          <span class="loading loading-dots loading-md text-primary" aria-hidden="true" />
          <span class="sr-only">Loading more channels…</span>
        </div>
      </template>

      <div v-else class="mt-10 rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
        <p class="text-base font-bold text-white/60">No channels match that search.</p>
        <button tabindex="0" @click="clearFilters" class="btn btn-primary btn-sm mt-4">CLEAR FILTERS</button>
      </div>
    </div>

    <!-- Channel player -->
    <Transition name="fade" mode="out-in">
      <div v-if="selectedChannel" key="player" ref="playerShell" tabindex="0" @pointermove="wakeControls"
        @keydown="wakeControls"
        class="relative col-span-4 flex h-dvh flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl focus:outline-none"
        :aria-label="`Playing ${selectedChannel.name}`">
        <div class="relative flex-1 bg-black">
          <video ref="videoEl" :key="playbackUrl" autoplay playsinline class="size-full object-contain"
            @error="playerError = true" @play="isPlaying = true" @pause="isPlaying = false">
            <source :src="playbackUrl" :type="playbackMimeType" />
            Your device does not support embedded video playback.
          </video>

          <div v-if="playerError" class="absolute inset-0 grid place-items-center bg-black/85 p-8 text-center">
            <div>
              <p class="font-bold">This stream could not start in the built-in player.</p>
              <p class="mt-2 text-sm text-white/50">
                Your provider may require a compatible player or block browser playback.
              </p>
            </div>
          </div>

          <!-- Netflix/YouTube-style chrome for the web/dev-preview inline player.
               On a native build, play() hands off to the native VideoPlayer plugin
               instead (see script) and this overlay is never mounted. -->
          <Transition name="fade">
            <div v-if="controlsVisible" class="absolute inset-0 flex flex-col justify-between">
              <div
                class="flex items-start justify-between gap-4 bg-linear-to-b from-black/75 via-black/20 to-transparent p-5">
                <div class="flex min-w-0 items-center gap-3">
                  <button tabindex="0" @click="closePlayer"
                    class="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/20 focus:outline-none focus-visible:border-primary/60"
                    aria-label="Close player">
                    <HugeiconsIcon :icon="Cancel01Icon" :size="16" />
                  </button>
                  <img v-if="selectedChannel.stream_icon" :src="selectedChannel.stream_icon" :alt="''" loading="lazy"
                    decoding="async" referrerpolicy="no-referrer" class="h-9 w-9 shrink-0 rounded-md object-contain"
                    @error="($event.target as HTMLImageElement).style.display = 'none'" />
                  <h2 class="truncate text-base font-black text-white drop-shadow">{{ selectedChannel.name }}</h2>
                </div>
                <span
                  class="flex shrink-0 items-center gap-1.5 rounded-full bg-error/85 px-3 py-1 text-[11px] font-black tracking-wider text-white backdrop-blur-md">
                  <span class="size-1.5 rounded-full bg-white motion-safe:animate-pulse" />
                  LIVE
                </span>
              </div>

              <div class="flex items-center gap-4 bg-linear-to-t from-black/80 via-black/25 to-transparent p-5">
                <button tabindex="0" @click="togglePlayback"
                  class="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/20 focus:outline-none focus-visible:border-primary/60"
                  :aria-label="isPlaying ? 'Pause' : 'Play'">
                  <HugeiconsIcon :icon="isPlaying ? PauseIcon : PlayIcon" :size="18" />
                </button>
                <button tabindex="0" @click="toggleMute"
                  class="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/20 focus:outline-none focus-visible:border-primary/60"
                  :aria-label="isMuted ? 'Unmute' : 'Mute'">
                  <HugeiconsIcon :icon="isMuted ? VolumeOffIcon : VolumeHighIcon" :size="18" />
                </button>
                <p class="ml-1 truncate text-xs font-bold uppercase tracking-[.14em] text-white/50">
                  Channel {{ selectedChannel.num ?? selectedChannel.stream_id }}
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <div v-else key="empty"
        class="col-span-4 grid place-items-center rounded-2xl border border-white/10 bg-white/2 text-center text-white/50 backdrop-blur-xl">
        <div>
          <svg width="220" height="220" viewBox="0 0 735 735" fill="none" xmlns="http://www.w3.org/2000/svg"
            class="mx-auto opacity-70">
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
          <p class="mt-4 text-sm font-bold uppercase tracking-[.16em] text-white/30">Select a channel to start watching
          </p>
        </div>
      </div>
    </Transition>
  </main>
</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onUnmounted, ref, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import { useRouter } from 'vue-router'
import { useXtream } from '@/composables/useXtream'
import { useSpatialNav } from '@/composables/useSpatialNav'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { XtreamLiveStream } from '@/types'
import {
  PlayIcon,
  PauseIcon,
  Cancel01Icon,
  Tv01Icon,
  Alert01Icon,
  VolumeHighIcon,
  VolumeOffIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons'
import SearchModal from '@/components/SearchModal.vue'


interface ChannelGroup {
  id: string
  name: string
  streams: XtreamLiveStream[]
}

const router = useRouter()
const { isAuthenticated, liveStreams, categories, getStreamPlaybackUrl } = useXtream()
// Search query is shared with the SearchModal component.
const query = ref('')
const showSearchModal = ref(false)
const selectedCategory = ref<string | null>(null)
const selectedChannel = ref<XtreamLiveStream | null>(null)
const playerError = ref(false)
const nativePlaybackError = ref('')

if (!isAuthenticated.value) router.replace('/login')
useSpatialNav({
  defaultFocusSelector: '#channel-search',
  onBack: () => {
    if (selectedChannel.value) closePlayer()
    else router.push('/home')
  },
})

const searchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
const categoryNames = computed(
  () =>
    new Map(
      categories.value.map((category) => [String(category.category_id), category.category_name]),
    ),
)
const availableCategories = computed(() =>
  [...new Set(liveStreams.value.map((stream) => String(stream.category_id || 'uncategorized')))]
    .map((id) => ({ id, name: categoryNames.value.get(id) || 'Uncategorised' }))
    .sort((a, b) => a.name.localeCompare(b.name)),
)

const channelGroups = computed<ChannelGroup[]>(() => {
  const grouped = new Map<string, ChannelGroup>()
  const terms = searchText(query.value).split(' ').filter(Boolean)

  for (const stream of liveStreams.value) {
    const categoryId = String(stream.category_id || 'uncategorized')
    const categoryName = categoryNames.value.get(categoryId) || 'Uncategorised'
    const searchable = searchText(`${stream.name} ${categoryName} ${stream.num ?? ''}`)
    if (selectedCategory.value && categoryId !== selectedCategory.value) continue
    if (terms.some((term) => !searchable.includes(term))) continue
    const group = grouped.get(categoryId) || { id: categoryId, name: categoryName, streams: [] }
    group.streams.push(stream)
    grouped.set(categoryId, group)
  }

  return [...grouped.values()]
    .map((group) => ({
      ...group,
      streams: group.streams.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const visibleChannelCount = computed(() =>
  channelGroups.value.reduce((total, group) => total + group.streams.length, 0),
)

// --- Lazy loading of category sections (batches of 6, grown as a sentinel
// scrolls into view) — unchanged from the previous version. ---
const BATCH_SIZE = 6
const visibleGroupCount = ref(BATCH_SIZE)
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const visibleGroups = computed(() => channelGroups.value.slice(0, visibleGroupCount.value))

watch([query, selectedCategory], () => {
  visibleGroupCount.value = BATCH_SIZE
})

watch(sentinel, (el) => {
  observer?.disconnect()
  if (!el) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        visibleGroupCount.value = Math.min(
          visibleGroupCount.value + BATCH_SIZE,
          channelGroups.value.length,
        )
      }
    },
    { rootMargin: '400px 0px' },
  )
  observer.observe(el)
})

onBeforeUnmount(() => observer?.disconnect())

// --- Playback ---
const playbackUrl = computed(() =>
  selectedChannel.value ? getStreamPlaybackUrl(selectedChannel.value) : '',
)
const playbackMimeType = computed(() =>
  playbackUrl.value.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp2t',
)

const videoEl = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(true)
const isMuted = ref(false)
function togglePlayback() {
  const video = videoEl.value
  if (!video) return
  if (video.paused) video.play()
  else video.pause()
}
function toggleMute() {
  const video = videoEl.value
  if (!video) return
  video.muted = !video.muted
  isMuted.value = video.muted
}

// Netflix/YouTube-style auto-hiding chrome for the inline web player only —
// the native path below opens the OS-level player plugin instead, which has
// its own controls this page never renders.
const controlsVisible = ref(true)
let hideTimer: number | undefined
function wakeControls() {
  controlsVisible.value = true
  window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(() => (controlsVisible.value = false), 4000)
}
watch(selectedChannel, async (channel) => {
  playerError.value = false
  isPlaying.value = true
  if (channel) {
    wakeControls()
    await nextTick()
    videoEl.value?.focus()
  } else {
    window.clearTimeout(hideTimer)
  }
})
onUnmounted(() => window.clearTimeout(hideTimer))

function closePlayer() {
  selectedChannel.value = null
}

async function play(stream: XtreamLiveStream) {
  playerError.value = false
  nativePlaybackError.value = ''

  if (Capacitor.isNativePlatform()) {
    try {
      const { VideoPlayer } = await import('@capgo/capacitor-video-player')
      const result = await VideoPlayer.initPlayer({
        mode: 'fullscreen',
        playerId: 'arenatv-live-player',
        url: getStreamPlaybackUrl(stream),
        title: stream.name,
        smallTitle: 'ArenaTV · Live TV',
        artwork: stream.stream_icon || '',
        showControls: true,
        pipEnabled: true,
        bkmodeEnabled: false,
        accentColor: '#00B783',
        chromecast: false,
      })
      if (!result.result)
        throw new Error(result.message || 'The native player could not start this stream.')
    } catch (cause) {
      nativePlaybackError.value =
        cause instanceof Error ? cause.message : 'The native player could not start this stream.'
    }
    return
  }

  selectedChannel.value = stream
}
function clearFilters() {
  query.value = ''
  selectedCategory.value = null
}
</script>
<style scoped>
.rise-enter-active,
.rise-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.rise-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
