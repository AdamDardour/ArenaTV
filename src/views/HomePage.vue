<template>
  <main class="overflow-auto h-dvh py-8 font-dm-sans">
    <div class="flex flex-row items-center justify-between gap-4 px-4">
      <div class="glassmorphism flex rounded-3xl px-4 py-2 text-sm font-bold text-white/70">
        <HugeiconsIcon :icon="FootballPitchIcon" :size="20" class="mr-2" />
        Football Fixtures
      </div>
      <button @click="fetchFixtures" class="btn glassmorphism-interactive rounded-3xl ">
        <HugeiconsIcon :icon="RefreshIcon" :size="20" />
        Refresh
      </button>
    </div>
    <div class="embla m-4">
      <div class="embla__viewport" ref="emblaRef">
        <div class="embla__container ">

          <div class="embla__slide h-96" v-if="bigClubFixtures.length">
            <div v-for="el in bigClubFixtures" :key="el.id">
              <BigClubsFixturesCard :fixture="el" />
            </div>
          </div>
          <div v-else
            class="embla__slide h-96 glassmorphism flex items-center justify-center rounded-3xl font-bold text-4xl">
            No Big Event For Today
          </div>
        </div>
      </div>


    </div>
    <div class="flex flex-col gap-2 ">
      <div v-for="fixture in fixtures" :key="fixture.id" class="p-4 rounded border-b border-white/20">
        <span class="text-2xl font-bold text-white ">{{ fixture.name }} </span>
        <div class="flex flex-row gap-2 overflow-auto my-4">
          <div v-for="(subFixture, index) in fixture.fixtures" :key="index">
            <FixturesCard :fixture="subFixture" />
          </div>
        </div>
      </div>
    </div>

  </main>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useXtream } from '@/composables/useXtream'
import { CapacitorHttp, type HttpResponse } from '@capacitor/core';
import useEmblaCarousel from 'embla-carousel-vue'
import Autoplay from 'embla-carousel-autoplay'
import FixturesCard from '@/components/FixturesCard.vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  RefreshIcon,
  FootballPitchIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@hugeicons/core-free-icons'
import BigClubsFixturesCard from '@/components/BigClubsFixturesCard.vue';
const router = useRouter()
const { isAuthenticated } = useXtream()
if (!isAuthenticated.value) router.replace('/login')
type Team = {
  id: number;
  name: string;
  shortName: string;
  logo: string;
};

type Fixture = {
  id: number;
  league: {
    id: number;
    name: string;
    shortName: string;
  };
  home: Team;
  away: Team;
  startingAt: string;
  status: string;
  state: string;
  homeScore: number;
  awayScore: number;
  venue?: {
    id: number;
    name: string;
  };
};

type LeagueFixtures = {
  id: number;
  name: string;
  shortName: string;
  fixtures: Fixture[];
};

type FixturesResponse = {
  date: string;
  updatedAt: string;
  leagues: LeagueFixtures[];
};

const BIG_CLUBS: Record<string, string[]> = {
  PL: [
    "Arsenal",
    "Chelsea",
    "Liverpool",
    "Manchester City",
    "Manchester United",
    "Tottenham Hotspur",
  ],

  LaLiga: [
    "Barcelona",
    "Real Madrid",
    "Atlético Madrid",
    "Atletico Madrid",
  ],

  Bundesliga: [
    "Bayern Munich",
    "Borussia Dortmund",
    "BVB",
  ],

  SerieA: [
    "Inter",
    "Inter Milan",
    "AC Milan",
    "Juventus",
    "Napoli",
  ],

  Ligue1: [
    "Paris Saint-Germain",
    "PSG",
    "Olympique Marseille",
    "Marseille",
  ],
};
const fixtures = ref<LeagueFixtures[]>([])
const bigClubFixtures = ref<Fixture[]>([])
function getBigClubFixtures(
  data: FixturesResponse
): Fixture[] {

  return data.leagues.flatMap((league) => {
    const bigClubs = BIG_CLUBS[league.shortName];

    if (!bigClubs) {
      return [];
    }

    return league.fixtures.filter((fixture) => {
      const homeIsBigClub = bigClubs.some(
        (club) =>
          fixture.home.name.toLowerCase() === club.toLowerCase()
      );

      const awayIsBigClub = bigClubs.some(
        (club) =>
          fixture.away.name.toLowerCase() === club.toLowerCase()
      );

      return homeIsBigClub || awayIsBigClub;
    });
  });
}
async function fetchFixtures() {
  const options = {
    url: `https://arenatv_server.arenatv.workers.dev/api/fixtures/today`,
  }
  const response: HttpResponse = await CapacitorHttp.get(options);
  fixtures.value = response.data.leagues;
  bigClubFixtures.value = getBigClubFixtures(response.data);

}

const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false }, [Autoplay()])
const scrollPrev = () => emblaApi.value?.scrollPrev()
const scrollNext = () => emblaApi.value?.scrollNext()
onMounted(() => {
  fetchFixtures()
})
watch(
  emblaApi,
  (api) => {
    if (!api) return
    api.plugins().autoplay?.play()
  },
  { immediate: true }
)

</script>
<style scoped>
.embla__viewport {
  overflow: hidden;
}

.embla__container {
  display: flex;
  touch-action: pan-y pinch-zoom;
}

.embla__slide {
  flex: 0 0 100%;
  min-width: 0;
}
</style>
