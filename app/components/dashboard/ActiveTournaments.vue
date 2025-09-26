<template>
  <div class="space-y-6">
    <UCard
      :ui="{
        header: { base: 'p-4 sm:p-6' },
        body: { base: 'p-4 sm:p-6' },
      }"
    >
      <template #header>
        <div class="flex items-center space-x-3">
          <UIcon name="i-heroicons-trophy" class="h-6 w-6 text-primary-500" />
          <h3 class="text-lg font-semibold">Tournaments</h3>
        </div>
      </template>

      <div class="space-y-4">
        <div v-if="tournamentOptions.length > 0">
          <div class="w-1/4">
            <select
              v-model="selectedTournamentId"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              @change="onTournamentChange"
            >
              <option :value="null">Select tournament...</option>
              <option
                v-for="option in tournamentOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div v-else class="text-center text-gray-500 dark:text-gray-400 py-4">
          <p>No active tournaments to display.</p>
        </div>

        <div
          v-if="selectedTournamentDetails"
          class="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
        >
          <h4 class="font-semibold text-lg mb-2">
            {{ selectedTournamentDetails.label }}
          </h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-500 dark:text-gray-400">
                Week:
              </span>
              {{ selectedTournamentDetails.week }}
            </div>
            <div>
              <span class="font-medium text-gray-500 dark:text-gray-400">
                Games:
              </span>
              {{ selectedTournamentDetails.games }}
            </div>
            <div>
              <span class="font-medium text-gray-500 dark:text-gray-400">
                Players:
              </span>
              {{ selectedTournamentDetails.players }}
            </div>
            <div>
              <span class="font-medium text-gray-500 dark:text-gray-400">
                Salary Cap:
              </span>
              {{ formatSalary(selectedTournamentDetails.salaryCap) }}
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["tournament-selected"]);

const selectedTournamentId = ref(null);

const tournamentOptions = computed(() => {
  if (!Array.isArray(props.data) || props.data.length === 0) {
    return [];
  }

  return props.data.map((tournament) => ({
    label: `Tournament ${tournament.slateId}`,
    value: tournament.slateId,
    week: tournament.week,
    games: tournament.dfsSlateGames?.length || 0,
    players: tournament.dfsSlatePlayers?.length || 0,
    salaryCap: tournament.salaryCap || 50000,
  }));
});

const selectedTournamentDetails = computed(() => {
  return (
    tournamentOptions.value.find(
      (t) => t.value === selectedTournamentId.value
    ) || null
  );
});

const formatSalary = (salary) => {
  if (typeof salary !== "number") return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(salary);
};

const onTournamentChange = () => {
  emit("tournament-selected", selectedTournamentId.value);
};

watch(
  () => props.data,
  (newData) => {
    const currentId = selectedTournamentId.value;
    const isStillValid = newData.some((t) => t.slateId === currentId);

    if (!isStillValid && currentId !== null) {
      selectedTournamentId.value = null;
      emit("tournament-selected", null);
    }
  },
  { deep: true, immediate: true }
);
</script>
