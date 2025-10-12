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
        <div
          v-if="tournamentOptions.length > 0"
          class="w-full md:w-1/3 lg:w-1/4"
        >
          <USelectMenu
            v-model="selectedTournament"
            :items="tournamentOptions"
            placeholder="Select tournament..."
            searchable
            searchable-placeholder="Search tournaments..."
            by="value"
          />
        </div>

        <div v-else class="text-center text-gray-500 dark:text-gray-400 py-4">
          <p>No active tournaments to display.</p>
        </div>

        <div
          v-if="selectedTournament"
          class="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
        >
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm"
          >
            <div>
              <span class="font-medium text-gray-500 dark:text-gray-400">
                Operator:
              </span>
              <span class="ml-2">{{ selectedTournament.operator }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-500 dark:text-gray-400">
                Game Type:
              </span>
              <span class="ml-2">{{
                selectedTournament.operatorGameType
              }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-500 dark:text-gray-400">
                Week:
              </span>
              <span class="ml-2">{{ selectedTournament.week }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-500 dark:text-gray-400">
                Games:
              </span>
              <span class="ml-2">{{ selectedTournament.games }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-500 dark:text-gray-400">
                Players:
              </span>
              <span class="ml-2">{{ selectedTournament.players }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-500 dark:text-gray-400">
                Salary Cap:
              </span>
              <span class="ml-2">{{
                formatSalary(selectedTournament.salaryCap)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { formatSalary } from "~/utils/helpers";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["tournament-selected"]);

const selectedTournament = ref(null);

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
    operator: tournament.operator || "N/A",
    operatorGameType: tournament.operatorGameType || "N/A",
  }));
});

watch(selectedTournament, (newValue) => {
  if (newValue) {
    emit("tournament-selected", newValue.value);
  } else {
    emit("tournament-selected", null);
  }
});

watch(
  () => props.data,
  (newData) => {
    if (selectedTournament.value) {
      const currentId = selectedTournament.value.value;
      if (!newData.some((t) => t.slateId === currentId)) {
        selectedTournament.value = null;
      }
    }
  },
  { deep: true }
);
</script>
