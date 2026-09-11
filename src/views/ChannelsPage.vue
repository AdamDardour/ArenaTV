<template>
  <main class="h-full grid grid-cols-8 ">
    <!--  Channel categories -->
    <div class="col-span-2 flex flex-col gap-2  h-dvh overflow-y-auto py-8 pb-16" aria-label="Channel categories">
      <button tabindex="0" @click="selectedCategory = null"
        class="cursor-pointer rounded-2xl border border-white/10  px-4 py-3 shadow-[0_1px_0_0_rgba(255,255,255,.04)_inset] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/8 hover:shadow-[0_8px_30px_-8px_rgba(201,255,74,.25)]"
        :class="selectedCategory === null ? 'bg-primary font-bold' : 'bg-white/4 text-white/55'">
        ALL <span class="badge badge-sm badge-primary mx-4">{{ liveStreams.length }}</span>
      </button>
      <button v-for="category in availableCategories" :key="category.id" tabindex="0"
        @click="selectedCategory = selectedCategory === category.id ? null : category.id"
        class="cursor-pointer rounded-2xl border border-white/10 hover:text-base-content  px-4 py-3 shadow-[0_1px_0_0_rgba(255,255,255,.04)_inset] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-white/8 hover:shadow-[0_8px_30px_-8px_rgba(201,255,74,.25)]"
        :class="selectedCategory === category.id ? 'bg-primary font-bold text-primary-content' : 'bg-white/4 text-base-content'">
        {{ category.name }}
      </button>
    </div>
    <!--  Channel list -->
    <div v-if="channelGroups.length" class="col-span-2 h-dvh overflow-y-auto py-8 pb-16">
      <section v-for="(group, groupIndex) in visibleGroups" :key="group.id" :aria-labelledby="`category-${group.id}`">
        <div class="mb-4 flex items-center gap-3">
          <span class="h-px w-8 bg-primary" />
          <h2 :id="`category-${group.id}`" class="text-lg font-black tracking-[-.02em]">
            {{ group.name }}
          </h2>
          <span class="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-bold text-white/40">{{
            group.streams.length }}</span>
        </div>
        <div class="flex flex-col gap-2  ">
          <!-- Channel card: glassmorphism -->
          <article v-for="stream in group.streams" :key="String(stream.stream_id)" @click="play(stream)"
            class="cursor-pointer group relative flex min-w-0 items-center justify-between gap-4  rounded-2xl border border-white/10 bg-white/4 px-4 py-1 shadow-[0_1px_0_0_rgba(255,255,255,.04)_inset] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/8 hover:shadow-[0_8px_30px_-8px_rgba(201,255,74,.25)]">
            <!-- subtle top sheen for the glass effect -->
            <span
              class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />
            <div class="relative flex min-w-0 items-center gap-3">
              <div
                class="flex size-16 shrink-0 items-center justify-center rounded-xl p-0 text-xs font-black text-primary">
                <img v-if="stream.stream_icon" :src="stream.stream_icon" :alt="''" loading="lazy" decoding="async"
                  referrerpolicy="no-referrer" class="size-full object-contain "
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

          </article>
        </div>
      </section>

      <!-- Lazy-load sentinel: reveals the next batch of categories as it scrolls into view -->
      <div v-if="visibleGroups.length < channelGroups.length" ref="sentinel" class="flex justify-center py-6">
        <span class="loading loading-dots loading-md text-primary" aria-hidden="true" />
        <span class="sr-only">Loading more channels…</span>
      </div>
    </div>

    <!--  Channel player -->

    <div v-if="selectedChannel" class="col-span-4  " :aria-label="`Playing ${selectedChannel.name}`">
      <section class="w-full ">

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
        <div class="flex flex-col  gap-4 border-b border-white/10 px-6 py-4">
          <p class="text-[11px] font-bold uppercase tracking-[.16em] text-primary">Now playing</p>
          <div class="min-w-0 flex items-center gap-2">

            <img v-if="selectedChannel.stream_icon" :src="selectedChannel.stream_icon" :alt="''" loading="lazy"
              decoding="async" referrerpolicy="no-referrer" class="h-16 w-16 rounded-lg object-contain"
              @error="($event.target as HTMLImageElement).style.display = 'none'" />
            <h2 class="truncate text-lg font-black">{{ selectedChannel.name }}</h2>
          </div>

        </div>
      </section>
    </div>
    <div v-else class="col-span-4 grid place-items-center text-center text-white/50 bgImage mask-x-from-90% ">
      <div>
        <svg width="128" height="128" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg"
          class="mx-auto opacity-80">
          <path
            d="M8.575 21.6087C8.575 18.7641 8.575 17.3425 9.41884 16.4581C10.2627 15.5737 11.6192 15.575 14.335 15.575H31.615C34.3308 15.575 35.6873 15.575 36.5312 16.4594C37.375 17.3412 37.375 18.7628 37.375 21.6074V30.66C37.375 33.5046 37.375 34.9262 36.5312 35.8106C35.6873 36.695 34.3308 36.695 31.615 36.695H14.335C11.6192 36.695 10.2627 36.695 9.41884 35.8106C8.575 34.9289 8.575 33.5072 8.575 30.6626V21.6087Z"
            stroke="#ffffff" stroke-width="2.94698" stroke-linejoin="round" />
          <path
            d="M22.975 28.7751C24.5656 28.7751 25.855 27.5931 25.855 26.1351C25.855 24.677 24.5656 23.4951 22.975 23.4951C21.3844 23.4951 20.095 24.677 20.095 26.1351C20.095 27.5931 21.3844 28.7751 22.975 28.7751Z"
            stroke="#ffffff" stroke-width="2.94698" stroke-linejoin="round" />
          <path
            d="M22.975 23.4951V16.8951M22.975 28.7751V35.3751M37.375 22.1751H33.775C33.3931 22.1751 33.0268 22.3141 32.7568 22.5617C32.4867 22.8092 32.335 23.145 32.335 23.4951V28.7751C32.335 29.1251 32.4867 29.4609 32.7568 29.7084C33.0268 29.956 33.3931 30.0951 33.775 30.0951H37.375M8.575 22.1751H12.175C12.5569 22.1751 12.9232 22.3141 13.1932 22.5617C13.4633 22.8092 13.615 23.145 13.615 23.4951V28.7751C13.615 29.1251 13.4633 29.4609 13.1932 29.7084C12.9232 29.956 12.5569 30.0951 12.175 30.0951H8.575"
            stroke="#ffffff" stroke-width="2.94698" stroke-linecap="round" stroke-linejoin="round" />
          <path
            d="M1.575 26.775C1.575 18.8559 1.575 14.8953 4.0362 12.4362C6.4974 9.97711 10.4559 9.97501 18.375 9.97501H26.775C34.6941 9.97501 38.6547 9.97501 41.1138 12.4362C43.5729 14.8974 43.575 18.8559 43.575 26.775C43.575 34.6941 43.575 38.6547 41.1138 41.1138C38.6526 43.5729 34.6941 43.575 26.775 43.575H18.375C10.4559 43.575 6.4953 43.575 4.0362 41.1138C1.5771 38.6526 1.575 34.6941 1.575 26.775Z"
            stroke="#ffffff" stroke-width="3.15" stroke-linecap="round" />
          <path d="M16.275 3.67501L22.575 9.97501L30.975 1.57501" stroke="#ffffff" stroke-width="3.15"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>

        <p class="mt-4 text-sm">Select a channel to start watching</p>
      </div>
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
<style scoped>
.bgImage {
  background-image: url('/bg1.jpg');
  background-size: cover;
  background-repeat: no-repeat;

  background-position: center;
}
</style>
