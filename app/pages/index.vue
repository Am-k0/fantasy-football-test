<template>
  <UContainer class="py-10">
    <div class="space-y-8">
      <div class="text-center">
        <div class="flex items-center justify-center gap-3 mb-2">
          <UIcon name="i-heroicons-trophy" class="w-10 h-10 text-primary-500" />
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Fantasy Football Dashboard
          </h1>
        </div>
      </div>

      <div v-if="pending" class="flex justify-center items-center h-64">
        <UButton loading size="lg" color="primary" variant="ghost">
          Loading...
        </UButton>
      </div>

      <div v-else-if="error">
        <UAlert
          icon="i-heroicons-exclamation-triangle"
          color="red"
          variant="solid"
          title="Error Loading Data"
          :description="`An error occurred: ${error.message}`"
        />
      </div>

      <div v-else-if="tournaments && tournaments.length > 0" class="space-y-12">
        <StatsCard :data="tournaments" />
        <ActiveTournaments
          :data="tournaments"
          @tournament-selected="handleTournamentSelection"
        />
        <ActiveMatches
          :data="tournaments"
          :selected-tournament-id="selectedTournamentId"
          @game-selected="handleGameSelection"
        />
      </div>

      <div v-else class="text-center py-12">
        <UAlert
          icon="i-heroicons-information-circle"
          color="blue"
          variant="soft"
          title="No Data Available"
          description="No tournaments found in data.json file."
        />
      </div>
    </div>
  </UContainer>
</template>

<script setup>
const tournaments = ref([]);
const pending = ref(true);
const error = ref(null);
const selectedTournamentId = ref(null);

const fetchData = async () => {
  try {
    pending.value = true;
    error.value = null;

    const response = await fetch("/data.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const jsonData = await response.json();

    console.log("Data successfully loaded:");

    tournaments.value = jsonData || [];

    return jsonData;
  } catch (err) {
    console.error("Error loading:", err);
    error.value = err;
    tournaments.value = [];
    throw err;
  } finally {
    pending.value = false;
  }
};

const handleGameSelection = (game) => {
  console.log("Selected match:", game);
};

const handleTournamentSelection = (tournamentId) => {
  console.log("Selected tournament:", tournamentId);
  selectedTournamentId.value = tournamentId;
};

onMounted(async () => {
  await fetchData();
});

watch(
  tournaments,
  (newTournaments) => {
    console.log("Tournaments changed:", newTournaments?.length);
  },
  { deep: true }
);
</script>
