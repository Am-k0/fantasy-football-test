<template>
  <div class="p-4 md:p-8 lg:p-12 space-y-8">
    <div class="text-center">
      <h1
        class="text-3xl lg:text-5xl font-extrabold text-gray-900 dark:text-white"
      >
        <UIcon name="i-heroicons-trophy" class="mr-2 text-primary-500" />
        Fantasy Football Dashboard
      </h1>
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
        title="Greška pri učitavanju podataka"
        :description="`Došlo je do greške: ${error.message}`"
      />
    </div>

    <div v-else-if="tournaments && tournaments.length > 0" class="space-y-12">
      <DashboardStatsCard :data="tournaments" />
      <DashboardActiveTournaments
        :data="tournaments"
        @tournament-selected="handleTournamentSelection"
      />
      <DashboardActiveMatches
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
        title="Nema podataka"
        description="Nisu pronađeni turniri u data.json fajlu."
      />
    </div>
  </div>
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

    console.log("Podaci uspešno učitani:");

    tournaments.value = jsonData || [];

    return jsonData;
  } catch (err) {
    console.error("Greška pri učitavanju:", err);
    error.value = err;
    tournaments.value = [];
    throw err;
  } finally {
    pending.value = false;
  }
};

const handleGameSelection = (game) => {
  console.log("Izabrana utakmica:", game);
};

const handleTournamentSelection = (tournamentId) => {
  console.log("Izabran turnir:", tournamentId);
  selectedTournamentId.value = tournamentId;
};

onMounted(async () => {
  await fetchData();
});

watch(
  tournaments,
  (newTournaments) => {
    console.log("Turniri se promenili:", newTournaments?.length);
  },
  { deep: true }
);
</script>
