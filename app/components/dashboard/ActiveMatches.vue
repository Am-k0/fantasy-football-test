<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold">
      {{ selectedTournamentId ? "Tournament Matches" : "Upcoming Matches" }}
    </h2>

    <div v-if="pending" class="text-center text-gray-500">
      Loading matches...
    </div>
    <div v-else-if="error" class="text-center text-red-500">
      Error loading data.
    </div>
    <div
      v-else-if="displayedGames.length === 0"
      class="text-center text-gray-500"
    >
      {{
        selectedTournamentId
          ? "No matches available for this tournament."
          : "No upcoming matches available."
      }}
    </div>
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="game in displayedGames"
          :key="`${game.slateId}-${game.id}`"
          :ui="{
            body: { padding: 'p-4' },
            ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
          }"
          class="transform transition-all hover:scale-105 hover:shadow-lg"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ formatWeek(game.week) }}
            </span>
          </div>
          <div class="space-y-4">
            <div class="text-center">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ game.awayTeam }} @ {{ game.homeTeam }}
              </h3>
            </div>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div class="flex items-center">
                <UIcon name="i-lucide-calendar" class="mr-2 h-4 w-4" />
                <span>{{ formatDate(game.dateTime) }}</span>
              </div>
              <div class="flex items-center">
                <UIcon name="i-lucide-map-pin" class="mr-2 h-4 w-4" />
                <span class="truncate">{{ game.stadiumName }}</span>
              </div>
              <div v-if="game.weather !== 'N/A'" class="flex items-center">
                <UIcon name="i-lucide-cloud" class="mr-2 h-4 w-4" />
                <span>{{ game.weather }}</span>
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

      <div v-if="hasMoreGames" class="text-center mt-6">
        <UButton color="gray" variant="ghost" @click="navigateTo('/matches')">
          <UIcon name="i-lucide-list" class="mr-1 h-4 w-4" />
          View All Matches
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["game-selected"]);

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  selectedTournamentId: {
    type: [String, Number, null],
    default: null,
  },
});

const { data: jsonData, pending, error } = await useFetch("/data.json");
const currentTournamentId = ref(props.selectedTournamentId);

const allGamesRaw = computed(() => {
  if (!jsonData.value) return [];

  const games = [];

  jsonData.value.forEach((slate) => {
    if (slate.dfsSlateGames) {
      slate.dfsSlateGames.forEach((slateGame, _gameIndex) => {
        const g = slateGame.game;
        if (g) {
          games.push({
            id: slateGame.slateGameId,
            globalGameId: g.globalGameId,
            gameKey: g.gameKey,
            awayTeam: g.awayTeam,
            homeTeam: g.homeTeam,
            dateTime: g.dateTime,
            stadiumName: g.stadiumDetails?.name || "N/A",
            weather: g.forecastDescription || "N/A",
            status: g.status || "N/A",
            week: g.week,
            slateId: slate.slateId,
          });
        }
      });
    }
  });

  return games.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
});

const allGamesUnique = computed(() => {
  return allGamesRaw.value.filter(
    (g, index, self) =>
      index === self.findIndex((x) => x.globalGameId === g.globalGameId)
  );
});

const tournamentGames = computed(() => {
  if (!currentTournamentId.value) return [];

  const filtered = allGamesRaw.value.filter(
    (game) => String(game.slateId) === String(currentTournamentId.value)
  );

  return filtered.filter((g, index, self) => {
    const key = `${g.globalGameId}-${g.slateId}`;
    const firstIndex = self.findIndex(
      (x) => `${x.globalGameId}-${x.slateId}` === key
    );
    return index === firstIndex;
  });
});

const displayedGames = computed(() => {
  if (currentTournamentId.value) {
    return tournamentGames.value.slice(0, 6);
  } else {
    return allGamesUnique.value.slice(0, 6);
  }
});

const hasMoreGames = computed(() => {
  if (currentTournamentId.value) {
    return tournamentGames.value.length > 6;
  } else {
    return allGamesUnique.value.length > 6;
  }
});

watch(
  () => props.selectedTournamentId,
  async (newId) => {
    await nextTick();
    currentTournamentId.value = newId;
  },
  { immediate: true }
);

const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatWeek = (week) => `Week ${week}`;

const selectGame = (game) => {
  navigateTo(`/matches/${game.id}`);
  emit("game-selected", game);
};
</script>
