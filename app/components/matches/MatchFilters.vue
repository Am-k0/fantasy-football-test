<template>
  <div
    class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
  >
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-gray-900 text-xl font-semibold dark:text-white">
        Filters
      </h2>
    </div>

    <div class="p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label
            for="tournament-filter"
            class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            Tournaments
          </label>
          <select
            id="tournament-filter"
            v-model="localFilters.slateId"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            @change="emitFilters"
          >
            <option
              value=""
              class="bg-white text-gray-500 dark:bg-gray-700 dark:text-gray-300"
            >
              Select tournament
            </option>

            <option
              v-for="slateId in tournamentOptions"
              :key="slateId"
              :value="slateId"
              class="bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            >
              Tournament {{ slateId }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="team-filter"
            class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            Team
          </label>
          <select
            id="team-filter"
            v-model="localFilters.team"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            @change="emitFilters"
          >
            <option
              value=""
              class="bg-white text-gray-500 dark:bg-gray-700 dark:text-gray-300"
            >
              Select team
            </option>

            <option
              v-for="team in teamOptions"
              :key="team"
              :value="team"
              class="bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            >
              {{ team }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="channel-filter"
            class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            TV Channel
          </label>
          <select
            id="channel-filter"
            v-model="localFilters.channel"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            @change="emitFilters"
          >
            <option
              value=""
              class="bg-white text-gray-500 dark:bg-gray-700 dark:text-gray-300"
            >
              Select channel
            </option>

            <option
              v-for="channel in channelOptions"
              :key="channel"
              :value="channel"
              class="bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            >
              {{ channel }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="stadium-filter"
            class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            Stadium Type
          </label>
          <select
            id="stadium-filter"
            v-model="localFilters.stadiumType"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            @change="emitFilters"
          >
            <option
              value=""
              class="bg-white text-gray-500 dark:bg-gray-700 dark:text-gray-300"
            >
              Stadium type
            </option>

            <option
              v-for="stadiumType in stadiumTypeOptions"
              :key="stadiumType"
              :value="stadiumType"
              class="bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            >
              {{ stadiumType }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="date-filter"
            class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            Date
          </label>
          <input
            id="date-filter"
            v-model="localFilters.date"
            type="date"
            placeholder="Select date"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            @input="emitFilters"
          />
        </div>
      </div>
    </div>

    <div
      class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end"
    >
      <button
        v-if="isAnyFilterActive"
        type="button"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        @click="clearFilters"
      >
        <svg
          class="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>

        Clear filters
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      date: "",
      team: "",
      channel: "",
      stadiumType: "",
      slateId: "",
    }),
  },

  matches: {
    type: Array,
    required: false,
    default: () => [],
  },

  isAnyFilterActive: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update-filters"]);

const localFilters = ref({
  ...props.filters,
  slateId: props.filters.slateId || "",
});

const tournamentOptions = computed(() => {
  if (!props.matches || props.matches.length === 0) return [];

  const slateIds = new Set();
  props.matches.forEach((game) => {
    if (game.slateId && game.slateId !== "Unknown") {
      slateIds.add(game.slateId);
    }
  });

  return Array.from(slateIds).sort((a, b) =>
    String(a).localeCompare(String(b), undefined, { numeric: true })
  );
});

const teamOptions = computed(() => {
  if (!props.matches || props.matches.length === 0) return [];
  const teams = new Set();
  props.matches.forEach((game) => {
    if (game.homeTeam) teams.add(game.homeTeam);
    if (game.awayTeam) teams.add(game.awayTeam);
  });
  return Array.from(teams).sort();
});

const channelOptions = computed(() => {
  if (!props.matches || props.matches.length === 0) return [];
  const channels = new Set();
  props.matches.forEach((game) => {
    if (game.channel && game.channel !== "N/A") channels.add(game.channel);
  });
  return Array.from(channels).sort();
});

const stadiumTypeOptions = computed(() => {
  if (!props.matches || props.matches.length === 0) return [];
  const types = new Set();
  props.matches.forEach((game) => {
    if (game.stadiumDetails?.type) types.add(game.stadiumDetails.type);
  });
  return Array.from(types).sort();
});

const emitFilters = () => {
  emit("update-filters", { ...localFilters.value });
};

const clearFilters = () => {
  localFilters.value = {
    date: "",
    team: "",
    channel: "",
    stadiumType: "",
    slateId: "",
  };
  emitFilters();
};

watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters };
  },
  { deep: true }
);
</script>
