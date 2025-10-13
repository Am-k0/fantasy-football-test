<template>
  <div class="space-y-8">
    <div
      v-if="displayedTournaments.length === 0"
      class="text-center text-gray-400 py-8"
    >
      <p>No matches available</p>
    </div>

    <div v-else>
      <div
        v-for="tournament in displayedTournaments"
        :key="tournament.slateId"
        class="space-y-6"
      >
        <div
          class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2"
        >
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
            Tournament {{ tournament.slateId }}
          </h2>
          <div class="text-sm text-gray-500 dark:text-gray-400 ml-4">
            {{ tournament.totalMatches }}
            {{ tournament.totalMatches === 1 ? "match" : "matches" }}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard
            v-for="game in tournament.displayedMatches"
            :key="game.id || `${game.homeTeam}-${game.awayTeam}-${game.date}`"
            :ui="{
              body: { padding: 'p-4' },
              ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
            }"
            class="transform transition-all hover:scale-105 hover:shadow-lg"
          >
            <div class="flex items-center justify-between mb-3">
              <span
                class="text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                {{ formatWeek(game.week) }}
              </span>
            </div>

            <div class="space-y-4">
              <div class="text-center">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ game.awayTeam || "TBA" }} vs {{ game.homeTeam || "TBA" }}
                </h3>
              </div>
              <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div class="flex items-center">
                  <UIcon name="i-lucide-calendar" class="mr-2 h-4 w-4" />
                  <span>{{ formatDate(game.date) }}</span>
                </div>
                <div class="flex items-center">
                  <UIcon name="i-lucide-map-pin" class="mr-2 h-4 w-4" />
                  <span class="truncate">{{
                    game.stadiumDetails?.name || "Stadium TBA"
                  }}</span>
                </div>
                <div v-if="game.forecastDescription" class="flex items-center">
                  <UIcon name="i-lucide-cloud" class="mr-2 h-4 w-4" />
                  <span>{{ game.forecastDescription }}</span>
                </div>
              </div>
              <div class="pt-2">
                <UButton
                  color="primary"
                  variant="soft"
                  size="sm"
                  block
                  @click="selectGame(game)"
                >
                  <UIcon name="i-lucide-eye" class="mr-1 h-4 w-4" />
                  View details
                </UButton>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Show More / Show All / Show Less za mečeve -->
        <div
          v-if="!props.isFiltered && tournament.totalMatches > 3"
          class="text-center"
        >
          <UButton
            v-if="tournament.viewState === 'initial'"
            color="gray"
            variant="ghost"
            @click="showMoreMatches(tournament.slateId)"
          >
            <UIcon name="i-heroicons-chevron-down" class="mr-2 h-4 w-4" />
            Show More
          </UButton>

          <div
            v-else-if="tournament.viewState === 'more'"
            class="flex items-center justify-center gap-3"
          >
            <UButton
              color="gray"
              variant="ghost"
              @click="showAllMatches(tournament.slateId)"
            >
              <UIcon
                name="i-heroicons-chevron-double-down"
                class="mr-2 h-4 w-4"
              />
              Show All
            </UButton>
            <UButton
              color="gray"
              variant="ghost"
              @click="showLessMatches(tournament.slateId)"
            >
              <UIcon name="i-heroicons-chevron-up" class="mr-2 h-4 w-4" />
              Show Less
            </UButton>
          </div>

          <UButton
            v-else-if="tournament.viewState === 'all'"
            color="gray"
            variant="ghost"
            @click="showLessMatches(tournament.slateId)"
          >
            <UIcon name="i-heroicons-chevron-up" class="mr-2 h-4 w-4" />
            Show Less
          </UButton>
        </div>
      </div>

      <!-- Show More / Show Less dugme za turnire -->
      <div
        v-if="
          !props.isFiltered &&
          (hasMoreTournaments || visibleTournamentsCount > TOURNAMENTS_PER_LOAD)
        "
        class="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-center gap-3">
          <UButton
            v-if="hasMoreTournaments"
            color="gray"
            variant="ghost"
            @click="loadMoreTournaments"
          >
            <UIcon name="i-heroicons-chevron-down" class="mr-2 h-4 w-4" />
            Show More Tournaments
          </UButton>

          <UButton
            v-if="visibleTournamentsCount > TOURNAMENTS_PER_LOAD"
            color="gray"
            variant="ghost"
            @click="showLessTournaments"
          >
            <UIcon name="i-heroicons-chevron-up" class="mr-2 h-4 w-4" />
            Show Less
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  formatDate,
  formatWeek,
  groupMatchesByTournament,
} from "~/utils/helpers";

const emit = defineEmits(["game-selected"]);

const props = defineProps({
  matches: {
    type: Array,
    default: () => [],
  },
  isFiltered: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();

const TOURNAMENTS_PER_LOAD = 5;

const visibleTournamentsCount = ref(TOURNAMENTS_PER_LOAD);
const tournamentViewStates = ref({});

const groupedMatches = computed(() => {
  return groupMatchesByTournament(props.matches);
});

const totalTournaments = computed(() => {
  return Object.keys(groupedMatches.value).length;
});

const hasMoreTournaments = computed(() => {
  return visibleTournamentsCount.value < totalTournaments.value;
});

const displayedTournaments = computed(() => {
  const tournaments = Object.entries(groupedMatches.value);

  const tournamentsToShow = props.isFiltered
    ? tournaments
    : tournaments.slice(0, visibleTournamentsCount.value);

  return tournamentsToShow.map(([slateId, matches]) => {
    const viewState = tournamentViewStates.value[slateId] || "initial";

    let displayedMatches;
    if (props.isFiltered) {
      displayedMatches = matches;
    } else {
      if (viewState === "initial") {
        displayedMatches = matches.slice(0, 3);
      } else if (viewState === "more") {
        displayedMatches = matches.slice(0, 9);
      } else {
        displayedMatches = matches;
      }
    }

    return {
      slateId,
      matches,
      displayedMatches,
      totalMatches: matches.length,
      viewState,
    };
  });
});

const loadMoreTournaments = () => {
  visibleTournamentsCount.value += TOURNAMENTS_PER_LOAD;
};

const showLessTournaments = () => {
  visibleTournamentsCount.value = TOURNAMENTS_PER_LOAD;
};

const showMoreMatches = (slateId) => {
  tournamentViewStates.value[slateId] = "more";
};

const showAllMatches = (slateId) => {
  tournamentViewStates.value[slateId] = "all";
};

const showLessMatches = (slateId) => {
  tournamentViewStates.value[slateId] = "initial";
};

const selectGame = (game) => {
  emit("game-selected", game);

  if (game.id) {
    router.push(`/matches/${game.id}`);
  } else {
    console.error("Game ID is missing, cannot navigate.");
  }
};

watch(
  () => props.matches,
  () => {
    tournamentViewStates.value = {};
    visibleTournamentsCount.value = TOURNAMENTS_PER_LOAD;
  },
  { deep: true }
);
</script>
