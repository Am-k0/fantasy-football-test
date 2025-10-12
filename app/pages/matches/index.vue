<template>
  <UContainer class="py-10">
    <div class="space-y-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <UButton loading size="lg" color="primary" variant="ghost">
          Loading matches...
        </UButton>
      </div>

      <!-- Error State -->
      <div v-else-if="error">
        <UAlert
          icon="i-heroicons-exclamation-triangle"
          color="red"
          variant="solid"
          title="Error loading matches"
          :description="error"
        />
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <div class="text-center">
          <div class="flex items-center justify-center gap-3 mb-2">
            <UIcon name="i-mdi-football" class="w-10 h-10 text-primary-500" />
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Matches
            </h1>
          </div>
        </div>

        <MatchFilters
          :filters="filters"
          :matches="matches"
          :is-any-filter-active="isAnyFilterActive"
          @update-filters="updateFilters"
        />

        <div v-if="filteredMatches.length > 0" class="mt-6">
          <MatchList
            :matches="filteredMatches"
            :is-filtered="isAnyFilterActive"
          />
        </div>
        <div v-else class="text-center py-12">
          <UAlert
            icon="i-heroicons-information-circle"
            color="blue"
            variant="soft"
            title="No matches found"
            description="No matches found for the selected filters."
          />
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup>
import { extractGamesFromTournaments } from "~/utils/helpers";

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
      const allGames = extractGamesFromTournaments(response);
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
