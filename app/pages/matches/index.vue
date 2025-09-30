<template>
  <div class="p-4 sm:p-8 space-y-6">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-lg font-medium text-gray-500 dark:text-gray-400">
        Loading matches...
      </div>
    </div>

    <div
      v-else-if="error"
      class="text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-4 rounded-md text-center"
    >
      <p><strong>Error loading matches:</strong> {{ error }}</p>
    </div>

    <div v-else class="space-y-6">
      <div class="flex items-center justify-center gap-3 mb-4">
        <UIcon name="i-mdi-football" class="w-7 h-7" />
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Matches
        </h1>
      </div>

      <MatchesMatchFilters
        :filters="filters"
        :matches="matches"
        :is-any-filter-active="isAnyFilterActive"
        @update-filters="updateFilters"
      />

      <div v-if="filteredMatches.length > 0" class="mt-6">
        <MatchesMatchList
          :matches="filteredMatches"
          :is-filtered="isAnyFilterActive"
        />
      </div>
      <div v-else class="text-center text-gray-500 dark:text-gray-400 py-8">
        No matches found for the selected filters.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const matches = ref([]);
const loading = ref(true);
const error = ref(null);

const filters = ref({
  date: "",
  team: "",
  channel: "",
  stadiumType: "",
  slateId: "",
});

onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await $fetch("/data.json");

    if (response && Array.isArray(response) && response.length > 0) {
      const allGames = [];

      response.forEach((tournament) => {
        const tournamentSlateId = tournament.slateId || "Unknown";

        if (
          tournament.dfsSlateGames &&
          Array.isArray(tournament.dfsSlateGames)
        ) {
          tournament.dfsSlateGames.forEach((slateGame) => {
            const gameData = slateGame.game;

            if (gameData) {
              const gameId =
                slateGame.slateGameId ||
                `${gameData.homeTeam || "TBA"}-${gameData.awayTeam || "TBA"}-${
                  gameData.dateTime || Date.now()
                }`;

              allGames.push({
                ...gameData,
                slateId: tournamentSlateId,
                slateGameId: slateGame.slateGameId,
                id: gameId,
                stadiumDetails: gameData.stadiumDetails || {},
                date: gameData.dateTime,
                forecastDescription: gameData.forecastDescription || "N/A",
                channel: gameData.channel || "N/A",
              });
            }
          });
        }
      });

      matches.value = allGames.filter((g) => g.date);

      if (matches.value.length === 0) {
        console.warn(
          "Parsed 0 matches. Data structure might be wrong or 'date' is missing."
        );
      }
    } else {
      throw new Error("Data structure is not as expected or data is empty.");
    }
  } catch (fetchError) {
    error.value = fetchError.message || "Failed to load data";
    console.error("Error loading matches:", fetchError);
    matches.value = [];
  } finally {
    loading.value = false;
  }
});

const updateFilters = (newFilters) => {
  filters.value = { ...newFilters };
};

const isAnyFilterActive = computed(() => {
  return Object.values(filters.value).some((filterValue) => !!filterValue);
});

const filteredMatches = computed(() => {
  if (!matches.value || matches.value.length === 0) return [];

  return matches.value.filter((game) => {
    const slateIdMatch =
      !filters.value.slateId ||
      String(game.slateId) === String(filters.value.slateId);

    const teamMatch =
      !filters.value.team ||
      game.homeTeam === filters.value.team ||
      game.awayTeam === filters.value.team;

    const channelMatch =
      !filters.value.channel || game.channel === filters.value.channel;

    const stadiumTypeMatch =
      !filters.value.stadiumType ||
      (game.stadiumDetails &&
        game.stadiumDetails.type === filters.value.stadiumType);

    const dateMatch =
      !filters.value.date ||
      (game.date && game.date.startsWith(filters.value.date));

    return (
      slateIdMatch && teamMatch && channelMatch && stadiumTypeMatch && dateMatch
    );
  });
});
</script>
