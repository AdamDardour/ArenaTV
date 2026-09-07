<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FootballMatch } from '@/types'
import { useXtream } from '@/composables/useXtream'
import { useSpatialNav } from '@/composables/useSpatialNav'
import { useSportsStore } from '@/stores/sports'
const router = useRouter()
const { isAuthenticated, candidatesFor } = useXtream()
const sports = useSportsStore()
const selected = ref<FootballMatch | null>(null)
if (!isAuthenticated.value) router.replace('/login')
onMounted(() => sports.refresh())
useSpatialNav({
  defaultFocusSelector: '#reload',
  onBack: () => {
    if (selected.value) selected.value = null
  },
})
const hero = computed(() => sports.live[0] || sports.upcoming[0])
const competitions = computed(() => [
  ...new Map(sports.matches.map((match) => [match.competitionName, match])).values(),
])
const format = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
function choose(match: FootballMatch) {
  selected.value = match
}
</script>
<template>
  <main class="relative h-full overflow-y-auto bg-[#080a08] pb-16">
    <div class="screen-grain pointer-events-none fixed inset-0" />
    <div class="lime-grid pointer-events-none fixed inset-0 opacity-[.18]" />
    <section
      class="relative mx-[5vw] mt-7 overflow-hidden rounded-4xl border border-white/10 bg-white/4.5 p-10 min-h-75"
    >
      <div class="absolute right-0 top-0 h-full w-2/5 bg-[#c9ff4a]/10 blur-[100px]" />
      <template v-if="hero">
        <p class="relative text-xs font-black uppercase tracking-[.2em] text-[#c9ff4a]">
          {{ hero.status === 'LIVE' ? 'Live now' : 'Next up' }} · {{ hero.competitionName }}
        </p>
        <h1 class="relative mt-5 text-5xl font-black tracking-[-.055em]">
          {{ hero.homeTeam.name }}
          <span class="mx-3 text-white/30">{{
            hero.status === 'LIVE' ? `${hero.homeScore ?? 0} — ${hero.awayScore ?? 0}` : 'vs'
          }}</span>
          {{ hero.awayTeam.name }}
        </h1>
        <p class="relative mt-4 text-white/50">
          {{ hero.stage || format(hero.utcDate) }}<span v-if="hero.venue"> · {{ hero.venue }}</span>
        </p>
        <button
          id="reload"
          tabindex="0"
          @click="choose(hero)"
          class="relative mt-8 rounded-xl bg-[#c9ff4a] px-6 py-3 font-black text-[#080a08]"
        >
          MATCH CENTRE
        </button>
      </template>
      <div v-else class="relative flex h-55 flex-col justify-center">
        <p class="text-sm font-bold uppercase tracking-[.2em] text-[#c9ff4a]">Sports data</p>
        <h1 class="mt-4 text-3xl font-black">
          {{
            sports.loading ? 'Loading live football…' : 'Your live scoreboard is ready to connect.'
          }}
        </h1>
        <p class="mt-3 max-w-2xl text-white/50">
          {{ sports.error || '`ArenaTV only renders provider-returned events. `' }}
        </p>
        <button
          id="reload"
          tabindex="0"
          @click="sports.refresh(true)"
          class="mt-6 w-fit rounded-xl border border-white/20 px-5 py-3 text-sm font-bold"
        >
          RETRY LIVE DATA
        </button>
      </div>
    </section>
    <section class="mx-[5vw] mt-10">
      <div class="mb-4 flex items-end justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[.18em] text-[#c9ff4a]">Live scoreboard</p>
          <h2 class="mt-1 text-2xl font-black">Live now</h2>
        </div>
        <span class="text-sm text-white/45">{{ sports.live.length }} live events</span>
      </div>
      <div v-if="sports.live.length" class="grid grid-cols-3 gap-5">
        <button
          v-for="match in sports.live"
          :key="match.id"
          tabindex="0"
          @click="choose(match)"
          class="glass rounded-2xl p-6 text-left transition"
        >
          <div class="flex justify-between text-xs font-bold uppercase tracking-wider">
            <span class="text-[#c9ff4a]">Live</span
            ><span class="text-white/45">{{ match.competitionName }}</span>
          </div>
          <div class="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <b class="text-lg">{{ match.homeTeam.shortName }}</b
            ><strong class="text-2xl"
              >{{ match.homeScore ?? 0 }} — {{ match.awayScore ?? 0 }}</strong
            ><b class="text-right text-lg">{{ match.awayTeam.shortName }}</b>
          </div>
        </button>
      </div>
      <p v-else class="rounded-2xl border border-dashed border-white/15 px-6 py-8 text-white/40">
        No provider-reported live matches right now.
      </p>
    </section>
    <section v-if="competitions.length" class="mx-[5vw] mt-10">
      <p class="text-xs font-bold uppercase tracking-[.18em] text-[#c9ff4a]">
        Available from your provider
      </p>
      <h2 class="mt-1 text-2xl font-black">Competitions</h2>
      <div class="mt-5 flex gap-4 overflow-x-auto pb-4">
        <button
          v-for="competition in competitions"
          :key="competition.competitionName"
          tabindex="0"
          @click="choose(competition)"
          class="glass min-w-64 rounded-2xl p-5 text-left"
        >
          <p class="text-sm font-bold">{{ competition.competitionName }}</p>
          <p class="mt-8 text-xs text-white/45">Open fixtures & channel finder →</p>
        </button>
      </div>
    </section>
    <section v-if="sports.upcoming.length" class="mx-[5vw] mt-8">
      <h2 class="text-2xl font-black">Coming up</h2>
      <div class="mt-5 grid grid-cols-4 gap-4">
        <button
          v-for="match in sports.upcoming.slice(0, 8)"
          :key="match.id"
          tabindex="0"
          @click="choose(match)"
          class="glass rounded-2xl p-5 text-left"
        >
          <p class="text-xs text-white/45">{{ format(match.utcDate) }}</p>
          <b class="mt-4 block"
            >{{ match.homeTeam.shortName }} <span class="text-white/30">vs</span>
            {{ match.awayTeam.shortName }}</b
          >
          <p class="mt-2 truncate text-xs text-[#c9ff4a]">{{ match.competitionName }}</p>
        </button>
      </div>
    </section>
    <aside
      v-if="selected"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-[12vw] pb-10 backdrop-blur-sm"
    >
      <div class="w-full max-w-5xl rounded-4xl border border-white/15 bg-[#11140f] p-9 shadow-2xl">
        <button tabindex="0" @click="selected = null" class="float-right text-sm text-white/50">
          CLOSE ×
        </button>
        <p class="text-xs font-bold uppercase tracking-[.18em] text-primary">
          {{ selected.competitionName }}
        </p>
        <h2 class="mt-3 text-3xl font-black">
          {{ selected.homeTeam.name }} <span class="text-white/35">vs</span>
          {{ selected.awayTeam.name }}
        </h2>
        <p class="mt-2 text-white/50">
          {{
            selected.status === 'LIVE'
              ? 'Live score and schedule supplied by your sports provider.'
              : format(selected.utcDate)
          }}
        </p>
        <div class="mt-7 border-t border-white/10 pt-6">
          <h3 class="font-bold">Watch this match</h3>
          <p class="mt-1 text-sm text-white/50">
            Potential channels are ranked from your own IPTV library only. ArenaTV does not claim
            broadcast availability.
          </p>
          <div v-if="candidatesFor(selected).length" class="mt-4 flex gap-3 overflow-x-auto">
            <button
              v-for="candidate in candidatesFor(selected).slice(0, 4)"
              :key="String(candidate.stream.stream_id)"
              tabindex="0"
              class="rounded-xl border border-white/15 bg-white/5 p-4 text-left min-w-52"
            >
              <b> {{ candidate.stream.name }}</b>
              <p class="mt-2 text-xs text-primary">
                {{ candidate.reason }} · {{ candidate.score }}%
              </p>
            </button>
          </div>
          <div
            v-else
            class="mt-4 rounded-xl border border-dashed border-white/20 p-4 text-white/55"
          >
            No matching channel found. Browse Sports Channels in Live TV.
          </div>
        </div>
      </div>
    </aside>
  </main>
</template>
