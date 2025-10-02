<template>
  <UContainer class="py-10">
    <!-- Loading State -->
    <div
      v-if="status === 'pending'"
      class="flex justify-center items-center min-h-64"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-primary-500"
      />
    </div>

    <!-- Error State -->
    <UCard v-else-if="status === 'error'">
      <template #header>
        <h1 class="text-xl font-bold text-red-600 dark:text-red-400">Error</h1>
      </template>
      <div class="text-center py-8">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-16 h-16 text-red-500 mx-auto mb-4"
        />
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          Player with ID {{ playerId }} was not found.
        </p>
        <UButton
          to="/players"
          icon="i-heroicons-arrow-left-20-solid"
          color="neutral"
          variant="ghost"
        >
          Back to list
        </UButton>
      </div>
    </UCard>

    <!-- Player Details -->
    <div v-else-if="player" class="space-y-6">
      <!-- Player Info Card -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Player Details
            </h1>
            <UButton
              to="/players"
              icon="i-heroicons-arrow-left-20-solid"
              size="sm"
              color="neutral"
              variant="ghost"
            >
              Back to list
            </UButton>
          </div>
        </template>

        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Player Avatar -->
          <div class="flex justify-center lg:justify-start">
            <div class="w-64 h-64 relative">
              <img
                :src="player.avatar"
                :alt="player.name"
                class="w-full h-full object-cover rounded-lg shadow-lg border-4 border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>

          <!-- Player Info -->
          <div class="flex-1 space-y-4">
            <!-- Name -->
            <h2 class="text-4xl font-bold text-gray-900 dark:text-white">
              {{ player.name }}
            </h2>

            <!-- Team -->
            <div class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-building-office-2"
                class="w-6 h-6 text-gray-500"
              />
              <p class="text-lg text-gray-700 dark:text-gray-300">
                <span class="font-medium text-gray-500 dark:text-gray-400"
                  >Team:</span
                >
                {{ player.team || "Free Agent" }}
              </p>
            </div>

            <!-- Main Position -->
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-map-pin" class="w-6 h-6 text-gray-500" />
              <p class="text-lg text-gray-700 dark:text-gray-300">
                <span class="font-medium text-gray-500 dark:text-gray-400"
                  >Position:</span
                >
                {{ player.position }}
              </p>
            </div>

            <!-- All Positions -->
            <div
              v-if="player.allPositions && player.allPositions.length > 0"
              class="flex items-center gap-3"
            >
              <UIcon
                name="i-heroicons-squares-plus"
                class="w-6 h-6 text-gray-500"
              />
              <p class="text-lg text-gray-700 dark:text-gray-300">
                <span class="font-medium text-gray-500 dark:text-gray-400"
                  >All positions:</span
                >
                <span v-for="(pos, i) in player.allPositions" :key="pos">
                  {{ pos
                  }}<span v-if="i < player.allPositions.length - 1">, </span>
                </span>
              </p>
            </div>

            <!-- Salary -->
            <div class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-banknotes"
                class="w-6 h-6 text-gray-500"
              />
              <p class="text-lg text-gray-700 dark:text-gray-300">
                <span class="font-medium text-gray-500 dark:text-gray-400"
                  >Salary:</span
                >
                <span class="font-bold text-green-600 dark:text-green-400">
                  ${{ formatSalary(player.salary) }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Fantasy Statistics Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-trophy" class="w-6 h-6 text-yellow-500" />
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              Fantasy Statistics
            </h2>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Fantasy Points -->
          <div
            class="text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-8"
          >
            <UIcon
              name="i-heroicons-star"
              class="w-16 h-16 text-purple-500 mx-auto mb-4"
            />
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Fantasy Points
            </p>
            <p class="text-4xl font-bold text-purple-600 dark:text-purple-400">
              {{ player.points || 0 }}
            </p>
          </div>

          <!-- Fantasy Points Per Dollar -->
          <div
            class="text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-8"
          >
            <UIcon
              name="i-heroicons-calculator"
              class="w-16 h-16 text-blue-500 mx-auto mb-4"
            />
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Points per Dollar
            </p>
            <p class="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {{ formatPointsPerDollar(player.fantasyPointsPerDollar) }}
            </p>
          </div>

          <!-- Projected Ownership -->
          <div
            class="text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-8"
          >
            <UIcon
              name="i-heroicons-chart-pie"
              class="w-16 h-16 text-green-500 mx-auto mb-4"
            />
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Projected Ownership
            </p>
            <p class="text-4xl font-bold text-green-600 dark:text-green-400">
              {{ formatProjectedOwnership(player.projectedOwnership) }}%
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
// Player data type from JSON
interface PlayerData {
  playerId: number;
  operatorPlayerName: string;
  operatorPosition: string;
  team: string | null;
  fantasyPoints?: number;
  operatorSalary?: number;
  fantasyPointsPerDollar?: number;
  projectedOwnership?: number;
  operatorRosterSlots?: string[];
}

// Slate type from JSON
interface Slate {
  dfsSlatePlayers?: PlayerData[];
}

// Player type for component
type Player = {
  id: number;
  name: string;
  position: string;
  team: string | null;
  avatar?: string;
  points?: number;
  salary?: number;
  fantasyPointsPerDollar?: number;
  projectedOwnership?: number;
  allPositions?: string[];
};

// Route and reactive data
const route = useRoute();
const playerId = Number(route.params.id);

const status = ref<"idle" | "pending" | "done" | "error">("idle");
const player = ref<Player | null>(null);

// Format salary
const formatSalary = (salary: number | undefined): string => {
  if (!salary) return "0";
  return salary.toLocaleString();
};

// Format points per dollar
const formatPointsPerDollar = (points: number | undefined): string => {
  if (!points) return "0.000";
  return points.toFixed(3);
};

// Format projected ownership
const formatProjectedOwnership = (value: number | undefined): string => {
  if (!value) return "0.000";
  return value.toFixed(3);
};

// Fetch player data
const fetchPlayerData = async () => {
  status.value = "pending";
  try {
    const res = await fetch("/data.json");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const json: Slate[] = await res.json();

    let foundPlayer: Player | null = null;

    for (const slate of json) {
      if (slate.dfsSlatePlayers) {
        const playerData = slate.dfsSlatePlayers.find(
          (p: PlayerData) => p.playerId === playerId
        );
        if (playerData) {
          foundPlayer = {
            id: playerData.playerId,
            name: playerData.operatorPlayerName,
            position: playerData.operatorPosition,
            team: playerData.team || null,
            avatar: "/images/player.png",
            points: playerData.fantasyPoints || 0,
            salary: playerData.operatorSalary || 0,
            fantasyPointsPerDollar: playerData.fantasyPointsPerDollar || 0,
            projectedOwnership: playerData.projectedOwnership || 0,
            allPositions: playerData.operatorRosterSlots || [
              playerData.operatorPosition,
            ],
          };
          break;
        }
      }
    }

    if (foundPlayer) {
      player.value = foundPlayer;
      status.value = "done";
    } else {
      status.value = "error";
    }
  } catch (e) {
    console.error("Error loading player data:", e);
    status.value = "error";
  }
};

// SEO Meta
useSeoMeta({
  title: computed(() =>
    player.value
      ? `${player.value.name} | Player Details`
      : `Player ${playerId} | Details`
  ),
  description: computed(() =>
    player.value
      ? `View detailed information about ${player.value.name}, ${
          player.value.position
        } from ${player.value.team || "Free Agent"}`
      : `Player details and fantasy statistics`
  ),
});

// Fetch on mount
onMounted(() => {
  fetchPlayerData();
});
</script>
