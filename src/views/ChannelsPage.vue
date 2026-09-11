<template>
  <main class="relative h-full overflow-y-auto bg-[#080a08] pb-16">
    <div class="screen-grain pointer-events-none fixed inset-0" />
    <div class="lime-grid pointer-events-none fixed inset-0 opacity-[.18]" />

    <section class="relative mx-[5vw] mt-7 overflow-hidden  bg-white/4.5 px-8 py-8 sm:px-10">
      <div class="absolute right-[7%] -top-full size-96 rounded-full bg-[#c9ff4a]/10 blur-[110px]" />
      <div class="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-black uppercase tracking-[.2em] text-primary">
            Your live library
          </p>
          <h1 class="mt-3 text-4xl font-black tracking-[-.055em] sm:text-5xl">
            Every channel. <span class="text-white/35">In order.</span>
          </h1>
          <p class="mt-3 max-w-xl text-sm leading-relaxed text-white/50">
            Browse your provider’s complete catalogue, grouped by category and sorted
            alphabetically.
          </p>
        </div>
        <label class="relative block w-full max-w-md">
          <span class="sr-only">Search channels</span>
          <HugeiconsIcon :icon="Search01Icon" :size="16"
            class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input id="channel-search" v-model="query" tabindex="0" type="search"
            placeholder="Search channel, number, or category…" class="input input-bordered w-full input-primary" />
          <button v-if="query" tabindex="0" @click="query = ''"
            class="btn btn-ghost btn-xs absolute right-3 top-1/2 -translate-y-1/2 gap-1 text-primary"
            aria-label="Clear search">
            <HugeiconsIcon :icon="Cancel01Icon" :size="14" />
            CLEAR
          </button>

        </label>
      </div>
    </section>

    <section class="mx-[5vw] mt-9">
      <div v-if="nativePlaybackError" role="alert"
        class="alert alert-error mb-5 border border-error/30 bg-error/10 text-sm backdrop-blur-md">
        <HugeiconsIcon :icon="Alert01Icon" :size="18" />
        <span>{{ nativePlaybackError }}</span>
        <button tabindex="0" @click="nativePlaybackError = ''" class="btn btn-ghost btn-xs">
          DISMISS
        </button>
      </div>
      <div class="mb-7 flex gap-2 overflow-x-auto pb-2" aria-label="Channel categories">
        <button tabindex="0" @click="selectedCategory = null" class="btn btn-sm shrink-0 rounded-full border-white/10"
          :class="selectedCategory === null ? 'btn-primary' : 'btn-ghost text-white/55'">
          ALL <span class="badge badge-sm border-0 bg-black/15">{{ liveStreams.length }}</span>
        </button>
        <button v-for="category in availableCategories" :key="category.id" tabindex="0"
          @click="selectedCategory = selectedCategory === category.id ? null : category.id"
          class="btn btn-sm shrink-0 rounded-full border-white/10"
          :class="selectedCategory === category.id ? 'btn-primary' : 'btn-ghost text-white/55'">
          {{ category.name }}
        </button>
      </div>
      <div class="mb-5 flex items-baseline justify-between">
        <p class="text-xs font-bold uppercase tracking-[.18em] text-white/45">
          {{ channelGroups.length }} categories
        </p>
        <p class="text-sm text-white/45">{{ visibleChannelCount }} results</p>
      </div>

      <div v-if="channelGroups.length" class="space-y-10">
        <section v-for="(group, groupIndex) in visibleGroups" :key="group.id" :aria-labelledby="`category-${group.id}`">
          <div class="mb-4 flex items-center gap-3">
            <span class="h-px w-8 bg-primary" />
            <h2 :id="`category-${group.id}`" class="text-lg font-black tracking-[-.02em]">
              {{ group.name }}
            </h2>
            <span class="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-bold text-white/40">{{
              group.streams.length }}</span>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <!-- Channel card: glassmorphism -->
            <article v-for="stream in group.streams" :key="String(stream.stream_id)"
              class="group relative flex min-w-0 items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 shadow-[0_1px_0_0_rgba(255,255,255,.04)_inset] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/[.08] hover:shadow-[0_8px_30px_-8px_rgba(201,255,74,.25)]">
              <!-- subtle top sheen for the glass effect -->
              <span
                class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <div class="relative flex min-w-0 items-center gap-3">
                <div
                  class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[.06] text-xs font-black text-primary">
                  <img v-if="stream.stream_icon" :src="stream.stream_icon" :alt="''" loading="lazy" decoding="async"
                    referrerpolicy="no-referrer" class="size-full object-cover"
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
              <button tabindex="0" @click="play(stream)" class="btn btn-ghost btn-circle btn-sm relative  text-primary"
                :aria-label="`Play ${stream.name}`">
                <HugeiconsIcon :icon="PlayIcon" :size="26" color="currentColor" />
              </button>
            </article>
          </div>
        </section>

        <!-- Lazy-load sentinel: reveals the next batch of categories as it scrolls into view -->
        <div v-if="visibleGroups.length < channelGroups.length" ref="sentinel" class="flex justify-center py-6">
          <span class="loading loading-dots loading-md text-primary" aria-hidden="true" />
          <span class="sr-only">Loading more channels…</span>
        </div>
      </div>

      <div v-else class="rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
        <p class="text-lg font-bold">No channels match that search.</p>
        <button tabindex="0" @click="clearFilters" class="btn btn-primary btn-sm mt-4">
          CLEAR FILTERS
        </button>
      </div>
    </section>

    <div v-if="selectedChannel"
      class="fixed inset-0 z-50 grid place-items-center bg-black/80 px-[5vw] py-8 backdrop-blur-sm" role="dialog"
      aria-modal="true" :aria-label="`Playing ${selectedChannel.name}`">
      <section class="w-full max-w-5xl overflow-hidden rounded-4xl border border-white/15 bg-[#11140f] shadow-2xl">
        <div class="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
          <div class="min-w-0">
            <p class="text-[11px] font-bold uppercase tracking-[.16em] text-primary">Now playing</p>
            <h2 class="truncate text-lg font-black">{{ selectedChannel.name }}</h2>
          </div>
          <button id="close-player" tabindex="0" @click="selectedChannel = null"
            class="btn btn-ghost btn-sm text-white/60">
            <HugeiconsIcon :icon="Cancel01Icon" :size="16" />
            CLOSE
          </button>
        </div>
        <div class="relative aspect-video bg-black">
          <video :key="playbackUrl" autoplay controls playsinline class="size-full" @error="playerError = true">
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
        </div>
      </section>
    </div>
  </main>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import { useRouter } from 'vue-router'
import { useXtream } from '@/composables/useXtream'
import { useSpatialNav } from '@/composables/useSpatialNav'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { XtreamLiveStream } from '@/types'
import {
  PlayIcon,
  Search01Icon,
  Cancel01Icon,
  Tv01Icon,
  Alert01Icon,
} from '@hugeicons/core-free-icons'
interface ChannelGroup {
  id: string
  name: string
  streams: XtreamLiveStream[]
}

const router = useRouter()
const { isAuthenticated, liveStreams, categories, getStreamPlaybackUrl } = useXtream()
const query = ref('')
const selectedCategory = ref<string | null>(null)
const selectedChannel = ref<XtreamLiveStream | null>(null)
const playerError = ref(false)
const nativePlaybackError = ref('')

if (!isAuthenticated.value) router.replace('/login')
useSpatialNav({
  defaultFocusSelector: '#channel-search',
  onBack: () => {
    if (selectedChannel.value) selectedChannel.value = null
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

// --- Lazy loading of category sections -----------------------------------
// Large Xtream playlists can carry thousands of channels across hundreds of
// categories. Rendering them all at once is what causes Android TV WebViews
// to jank on open. Instead we render a small batch of categories up front
// and grow that batch as the user scrolls, using an IntersectionObserver on
// a sentinel element placed after the rendered groups.
const BATCH_SIZE = 6
const visibleGroupCount = ref(BATCH_SIZE)
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const visibleGroups = computed(() => channelGroups.value.slice(0, visibleGroupCount.value))

// Reset the batch whenever the filtered set changes (new search/category),
// so we don't keep an oversized window from a previous, larger result set.
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

const playbackUrl = computed(() =>
  selectedChannel.value ? getStreamPlaybackUrl(selectedChannel.value) : '',
)
const playbackMimeType = computed(() =>
  playbackUrl.value.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp2t',
)
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
