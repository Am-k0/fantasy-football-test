<template>
  <div>
    <div
      v-if="showTeamLimitWarning"
      class="mx-6 mt-4 mb-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
    >
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="h-5 w-5 text-yellow-600"
        />
        <p class="text-sm text-yellow-800 dark:text-yellow-200">
          You can only select up to 2 players from the same team
        </p>
      </div>
    </div>

    <div
      v-if="hasActiveFilters"
      class="mx-6 mt-4 mb-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Active filters:
        </span>

        <div
          v-if="selectedTeam"
          class="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
        >
          <span>Team: {{ selectedTeam }}</span>
          <button
            class="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
            @click="$emit('clearTeam')"
          >
            <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
          </button>
        </div>

        <div
          v-if="minPointsFilter > 0"
          class="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm"
        >
          <span>Min Points: {{ minPointsFilter }}+</span>
          <button
            class="ml-1 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100"
            @click="$emit('clearPoints')"
          >
            <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
          </button>
        </div>

        <div
          v-if="maxSalaryFilter > 0"
          class="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
        >
          <span>Max Salary: ${{ formatSalaryNumber(maxSalaryFilter) }}</span>
          <button
            class="ml-1 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
            @click="$emit('clearSalary')"
          >
            <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
          </button>
        </div>

        <UButton
          variant="ghost"
          size="sm"
          class="ml-2"
          @click="$emit('clearAll')"
        >
          Clear All
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatSalaryNumber } from "~/utils/helpers";

defineProps<{
  showTeamLimitWarning: boolean;
  hasActiveFilters: boolean;
  selectedTeam: string;
  minPointsFilter: number;
  maxSalaryFilter: number;
}>();

defineEmits<{
  clearTeam: [];
  clearPoints: [];
  clearSalary: [];
  clearAll: [];
}>();
</script>
