<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- Active Tournaments -->
    <UCard
      class="transform transition-transform hover:scale-105"
      :ui="{
        header: { padding: 'p-4 sm:p-6' },
        body: { padding: 'p-4 sm:p-6' },
      }"
    >
      <template #header>
        <div class="flex items-center space-x-2">
          <UIcon
            name="i-heroicons-globe-alt"
            class="h-6 w-6 text-primary-500"
          />
          <h2 class="text-xl font-semibold">Active Tournaments</h2>
        </div>
      </template>
      <div class="text-4xl font-bold text-gray-900 dark:text-white">
        {{ data.length }}
      </div>
      <p class="mt-2 text-gray-500 dark:text-gray-400">
        Total available tournaments (Slates)
      </p>
    </UCard>

    <!-- Total Number of Games -->
    <UCard
      class="transform transition-transform hover:scale-105"
      :ui="{
        header: { padding: 'p-4 sm:p-6' },
        body: { padding: 'p-4 sm:p-6' },
      }"
    >
      <template #header>
        <div class="flex items-center space-x-2">
          <UIcon
            name="i-heroicons-calendar-days"
            class="h-6 w-6 text-primary-500"
          />
          <h2 class="text-xl font-semibold">Total Games</h2>
        </div>
      </template>
      <div class="text-4xl font-bold text-gray-900 dark:text-white">
        {{ totalGames }}
      </div>
      <p class="mt-2 text-gray-500 dark:text-gray-400">
        Games across all tournaments
      </p>
    </UCard>

    <!-- Average Salary -->
    <UCard
      class="transform transition-transform hover:scale-105"
      :ui="{
        header: { padding: 'p-4 sm:p-6' },
        body: { padding: 'p-4 sm:p-6' },
      }"
    >
      <template #header>
        <div class="flex items-center space-x-2">
          <UIcon
            name="i-heroicons-currency-dollar"
            class="h-6 w-6 text-primary-500"
          />
          <h2 class="text-xl font-semibold">Average Salary Per Player</h2>
        </div>
      </template>
      <div class="text-4xl font-bold text-gray-900 dark:text-white">
        {{ formatSalary(averageSalary) }}
      </div>
      <p class="mt-2 text-gray-500 dark:text-gray-400">
        Average salary of all players
      </p>
    </UCard>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

const totalGames = computed(() => {
  return props.data.reduce(
    (sum, slate) => sum + (slate.dfsSlateGames?.length || 0),
    0
  );
});

const averageSalary = computed(() => {
  let totalSalary = 0;
  let playerCount = 0;
  props.data.forEach((slate) => {
    slate.dfsSlatePlayers?.forEach((player) => {
      if (player.operatorSalary && player.operatorSalary > 0) {
        totalSalary += player.operatorSalary;
        playerCount++;
      }
    });
  });
  return playerCount > 0 ? totalSalary / playerCount : 0;
});

const formatSalary = (salary) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(salary);
};
</script>
