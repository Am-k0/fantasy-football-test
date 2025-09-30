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
        <div class="flex items-center justify-between">
          <h2
            class="text-2xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex-1"
          >
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
                  {{ game.awayTeam || "TBA" }} @ {{ game.homeTeam || "TBA" }}
                </h3>
              </div>
              <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div class="flex items-center">
                  <UIcon name="i-lucide-calendar" class="mr-2 h-4 w-4" />
                  <span>{{ formatDateTime(game.date) }}</span>
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

        <div
          v-if="!props.isFiltered && tournament.totalMatches > 3"
          class="text-center"
        >
          <UButton
            color="gray"
            variant="ghost"
            @click="toggleTournament(tournament.slateId)"
          >
            <UIcon
              name="i-heroicons-chevron-down"
              class="w-4 h-4 mr-2 transition-transform"
              :class="{ 'rotate-180': expandedTournaments[tournament.slateId] }"
            />
            {{
              tournament.isExpanded
                ? "Show less"
                : `Show all ${tournament.totalMatches} matches`
            }}
          </UButton>
        </div>
      </div>

      <div
        v-if="!props.isFiltered && totalTournaments > 6"
        class="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
      >
        <UButton
          color="gray"
          variant="ghost"
          size="lg"
          @click="showAllTournaments = !showAllTournaments"
        >
          <UIcon name="i-lucide-list" class="mr-1 h-4 w-4" />
          View all tournaments
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

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

const expandedTournaments = ref({});
const showAllTournaments = ref(false);

const formatDateTime = (dateString) => {
  if (!dateString) return "TBA";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
};

const formatWeek = (week) => {
  return week ? `Week ${week}` : "Week N/A";
};

const groupedMatches = computed(() => {
  if (!props.matches || props.matches.length === 0) {
    return {};
  }

  const groups = {};
  props.matches.forEach((match) => {
    const slateId = match.slateId || "Unknown";

    if (!groups[slateId]) {
      groups[slateId] = [];
    }
    groups[slateId].push(match);
  });

  const sortedGroups = Object.keys(groups)
    .sort((a, b) => a.localeCompare(b))
    .reduce((result, key) => {
      result[key] = groups[key];
      return result;
    }, {});

  return sortedGroups;
});

const totalTournaments = computed(() => {
  return Object.keys(groupedMatches.value).length;
});

const displayedTournaments = computed(() => {
  const tournaments = Object.entries(groupedMatches.value);

  const tournamentsToShow =
    !props.isFiltered && !showAllTournaments.value
      ? tournaments.slice(0, 6)
      : tournaments;

  const result = tournamentsToShow.map(([slateId, matches]) => {
    const isExpanded = props.isFiltered || !!expandedTournaments.value[slateId];

    const displayedMatches =
      props.isFiltered || isExpanded ? matches : matches.slice(0, 3);

    return {
      slateId,
      matches,
      displayedMatches,
      totalMatches: matches.length,
      isExpanded: isExpanded,
    };
  });

  return result;
});

const toggleTournament = (slateId) => {
  if (!props.isFiltered) {
    expandedTournaments.value[slateId] = !expandedTournaments.value[slateId];
  }
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
    expandedTournaments.value = {};
    showAllTournaments.value = false;
  },
  { deep: true }
);
</script>
