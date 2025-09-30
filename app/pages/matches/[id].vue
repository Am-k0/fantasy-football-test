<template>
  <UContainer class="py-10">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold">Match Details</h1>
        <UButton
          icon="i-heroicons-arrow-left"
          size="sm"
          color="neutral"
          variant="ghost"
          @click="navigateTo('/matches')"
        >
          Back to matches
        </UButton>
      </div>

      <!-- Match Info -->
      <div class="text-center p-4">
        <h2 class="text-3xl font-extrabold">
          <span class="text-blue-600">{{ matchData?.awayTeam }}</span> vs
          <span class="text-red-600">{{ matchData?.homeTeam }}</span>
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Season {{ matchData?.season || "TBA" }} - Week {{ matchData?.week }}
        </p>
        <p class="mt-2 text-gray-600 dark:text-gray-300">
          {{ matchData?.status }}
        </p>
        <USeparator class="mt-4" />
      </div>

      <!-- Tabs -->
      <UTabs
        :items="tabItems"
        variant="link"
        :ui="{ trigger: 'grow' }"
        class="gap-4 w-full"
      >
        <!-- Details Tab -->
        <template #details>
          <div v-if="matchData" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Match Details Card -->
              <UCard>
                <template #header>
                  <h3 class="text-lg font-semibold flex items-center">
                    <UIcon name="i-heroicons-information-circle" class="mr-2" />
                    Match Details
                  </h3>
                </template>
                <div class="space-y-3">
                  <p class="flex items-center">
                    <UIcon name="i-lucide-calendar" class="size-5 mr-2" />
                    <span class="font-medium">Date: </span>
                    {{ formatDate(matchData.dateTime) }}
                  </p>
                  <p class="flex items-center">
                    <UIcon name="i-lucide-map-pin" class="size-5 mr-2" />
                    <span class="font-medium">Stadium: </span>
                    {{ matchData.stadiumName }}
                  </p>
                  <p class="flex items-center">
                    <UIcon name="i-lucide-tv" class="size-5 mr-2" />
                    <span class="font-medium">Channel: </span>
                    <span v-if="matchData.tvChannel">{{
                      matchData.tvChannel
                    }}</span>
                    <span v-else>TBA</span>
                  </p>
                </div>
              </UCard>

              <!-- Weather Card -->
              <UCard>
                <template #header>
                  <h3 class="text-lg font-semibold flex items-center">
                    <UIcon name="i-lucide-cloud" class="mr-2 size-5" />
                    Weather Conditions
                  </h3>
                </template>
                <div class="space-y-3">
                  <p class="flex items-center">
                    <UIcon name="i-lucide-cloud" class="mr-2 size-5" />
                    <span class="font-medium">Description: </span>
                    {{ matchData.weather.description }}
                  </p>
                  <p class="flex items-center">
                    <UIcon name="i-lucide-thermometer" class="size-5 mr-2" />
                    <span class="font-medium">Temperature: </span>
                    {{ matchData.weather.temperature }}°F
                  </p>
                  <p class="flex items-center">
                    <UIcon name="i-lucide-wind" class="size-5 mr-2" />
                    <span class="font-medium">Wind Speed: </span>
                    {{ matchData.weather.windSpeed }} mph
                  </p>
                </div>
              </UCard>
            </div>
          </div>
        </template>

        <!-- Stadium Tab -->
        <template #stadium>
          <div v-if="matchData" class="space-y-6">
            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold flex items-center">
                  <UIcon name="i-lucide-soccer-pitch" class="mr-2 size-5" />
                  Stadium Information
                </h3>
              </template>
              <div class="p-4">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <!-- Basic Info -->
                  <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <h4 class="text-md font-semibold mb-3 flex items-center">
                      <UIcon name="i-lucide-info" class="size-4 mr-2" />
                      Basic Info
                    </h4>
                    <p>
                      <span class="font-medium">Name:</span>
                      {{ matchData.stadium?.name }}
                    </p>
                    <p>
                      <span class="font-medium">City:</span>
                      {{ matchData.stadium?.city }}
                    </p>
                    <p>
                      <span class="font-medium">Capacity:</span>
                      {{ formatNumber(matchData.stadium?.capacity) }}
                    </p>
                    <p>
                      <span class="font-medium">Type:</span>
                      {{ matchData.stadium?.type }}
                    </p>
                  </div>

                  <!-- Location -->
                  <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <h4 class="text-md font-semibold mb-3 flex items-center">
                      <UIcon name="i-lucide-map-pin" class="size-4 mr-2" />
                      Location
                    </h4>
                    <p>
                      <span class="font-medium">Geo Lat:</span>
                      {{ matchData.stadium?.geoLat }}
                    </p>
                    <p>
                      <span class="font-medium">Geo Long:</span>
                      {{ matchData.stadium?.geoLong }}
                    </p>
                    <p>
                      <span class="font-medium">Surface:</span>
                      {{ matchData.stadium?.playingSurface }}
                    </p>
                  </div>

                  <!-- Stadium Image -->
                  <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <h4 class="text-md font-semibold mb-3 flex items-center">
                      <UIcon name="i-lucide-camera" class="size-4 mr-2" />
                      Stadium View
                    </h4>
                    <div
                      class="aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
                    >
                      <img
                        :src="getStadiumImage(matchData.stadium.type)"
                        :alt="`${matchData.stadium.name} Stadium`"
                        class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </template>

        <!-- Odds Tab -->
        <template #odds>
          <div v-if="matchData" class="space-y-6">
            <!-- Money Lines -->
            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold flex items-center">
                  <UIcon name="i-lucide-trending-up" class="mr-2" />
                  Money Lines
                </h3>
              </template>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="rounded-lg p-6 border text-center">
                  <h4 class="text-lg font-bold mb-2 text-blue-600">
                    {{ matchData.awayTeam }}
                  </h4>
                  <div class="text-3xl font-extrabold">
                    {{ matchData.odds?.awayWin }}
                  </div>
                  <p class="text-xs mt-1">Away Win</p>
                </div>
                <div class="rounded-lg p-6 border text-center">
                  <h4 class="text-lg font-bold mb-2 text-red-600">
                    {{ matchData.homeTeam }}
                  </h4>
                  <div class="text-3xl font-extrabold">
                    {{ matchData.odds?.homeWin }}
                  </div>
                  <p class="text-xs mt-1">Home Win</p>
                </div>
              </div>
            </UCard>

            <!-- Spread & Over/Under -->
            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold flex items-center">
                  <UIcon name="i-lucide-activity" class="mr-2" />
                  Spread & Over/Under
                </h3>
              </template>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="rounded-lg p-6 text-center">
                  <h4 class="font-semibold mb-2">Point Spread</h4>
                  <div class="text-2xl font-bold">
                    {{ matchData.odds?.pointSpread }}
                  </div>
                </div>
                <div class="rounded-lg p-6 text-center">
                  <h4 class="font-semibold mb-2">Over/Under</h4>
                  <div class="text-2xl font-bold">
                    {{ matchData.odds?.overUnder }}
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </template>
      </UTabs>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
interface Stadium {
  name: string;
  city: string;
  capacity: string;
  type: string;
  geoLat: string;
  geoLong: string;
  playingSurface?: string;
}

interface Weather {
  description: string;
  temperature: number;
  windSpeed: number;
}

interface Odds {
  homeWin: string;
  awayWin: string;
  pointSpread: string;
  overUnder: string;
}

interface MatchData {
  id: number;
  gameKey: string;
  awayTeam: string;
  homeTeam: string;
  dateTime: string;
  stadiumName: string;
  stadium: Stadium;
  weather: Weather;
  tvChannel: string | null;
  week: number;
  season: string | number;
  status: string;
  odds: Odds;
}

interface SlateGame {
  slateGameId: number;
  gameId: number;
  operatorGameId: number;
  game: {
    gameKey: string;
    season: number;
    week: number;
    awayTeam: string;
    homeTeam: string;
    dateTime: string;
    channel?: string;
    pointSpread?: string;
    overUnder?: string;
    homeTeamMoneyLine?: string;
    awayTeamMoneyLine?: string;
    stadiumDetails?: Stadium;
    forecastDescription?: string;
    forecastTempLow?: number;
    forecastWindSpeed?: number;
    status?: string;
  };
}

interface Slate {
  dfsSlateGames: SlateGame[];
}

const route = useRoute();
const { id } = route.params;
const { data: jsonData } = await useFetch<Slate[]>("/data.json");

const matchData = computed((): MatchData | null => {
  if (!jsonData.value) return null;

  let foundMatch: MatchData | null = null;
  jsonData.value.forEach((slate) => {
    slate.dfsSlateGames.forEach((slateGame) => {
      if (String(slateGame.slateGameId) === String(id)) {
        const g = slateGame.game;
        foundMatch = {
          id: slateGame.slateGameId,
          gameKey: g.gameKey,
          awayTeam: g.awayTeam,
          homeTeam: g.homeTeam,
          dateTime: g.dateTime,
          stadiumName: g.stadiumDetails?.name || "N/A",
          stadium: {
            name: g.stadiumDetails?.name || "N/A",
            city: g.stadiumDetails?.city || "N/A",
            capacity: g.stadiumDetails?.capacity || "N/A",
            type: g.stadiumDetails?.type || "N/A",
            geoLat: g.stadiumDetails?.geoLat || "N/A",
            geoLong: g.stadiumDetails?.geoLong || "N/A",
            playingSurface: g.stadiumDetails?.playingSurface || "Artificial",
          },
          weather: {
            description: g.forecastDescription || "Clear Sky",
            temperature: g.forecastTempLow || 87,
            windSpeed: g.forecastWindSpeed || 5,
          },
          tvChannel: g.channel || null,
          odds: {
            homeWin: g.homeTeamMoneyLine || "-179",
            awayWin: g.awayTeamMoneyLine || "147",
            pointSpread: g.pointSpread || "-3.5",
            overUnder: g.overUnder || "48.5",
          },
          week: g.week,
          season: g.season || "N/A",
          status: g.status || "Scheduled",
        };
      }
    });
  });
  return foundMatch;
});

const tabItems = [
  { label: "Details", icon: "i-heroicons-information-circle", slot: "details" },
  { label: "Stadium", icon: "i-lucide-soccer-pitch", slot: "stadium" },
  { label: "Odds", icon: "i-heroicons-calculator", slot: "odds" },
];

const formatDate = (dateString: string): string => {
  if (!dateString) return "TBA";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
};

const formatNumber = (value: string | number): string => {
  if (typeof value === "string" && !isNaN(Number(value))) {
    return Number(value).toLocaleString();
  }
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  return value.toString();
};

const getStadiumImage = (stadiumType: string): string => {
  const type = stadiumType?.toLowerCase();
  switch (type) {
    case "dome":
      return "/images/stadionDome.jpg";
    case "outdoor":
      return "/images/stadionOutdoor.jpg";
    case "retractabledome":
      return "/images/stadion3.jpg";
    default:
      return "/images/stadionOutdoor.jpg";
  }
};
</script>
