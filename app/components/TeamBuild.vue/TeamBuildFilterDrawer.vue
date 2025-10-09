<template>
  <UDrawer
    v-model:open="isOpen"
    direction="right"
    :ui="{ content: 'min-w-55', overlay: 'bg-black/30' }"
  >
    <template #content>
      <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Filter Players
          </h3>
          <UButton
            variant="ghost"
            icon="i-heroicons-x-mark"
            size="sm"
            @click="isOpen = false"
          />
        </div>

        <div class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Team
            </label>
            <select
              :value="selectedTeam"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="
                $emit(
                  'update:selectedTeam',
                  ($event.target as HTMLSelectElement).value
                )
              "
            >
              <option value="">All Teams</option>
              <option v-for="team in availableTeams" :key="team" :value="team">
                {{ team }}
              </option>
            </select>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Minimum Fantasy Points
            </label>
            <UInput
              :model-value="minPoints"
              type="number"
              placeholder="Enter minimum points..."
              class="w-full"
              @update:model-value="$emit('update:minPoints', Number($event))"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Maximum Salary
            </label>
            <UInput
              :model-value="maxSalary"
              type="number"
              placeholder="Enter maximum salary..."
              class="w-full"
              @update:model-value="$emit('update:maxSalary', Number($event))"
            />
            <p class="text-xs text-gray-500 mt-1">
              Remaining budget: ${{ formatSalaryNumber(remainingBudget) }}
            </p>
          </div>
        </div>

        <div
          class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <UButton variant="outline" class="flex-1" @click="$emit('clearAll')">
            Clear All
          </UButton>
          <UButton
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            @click="isOpen = false"
          >
            Apply Filters
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatSalaryNumber } from "~/utils/helpers";

const props = defineProps<{
  open: boolean;
  selectedTeam: string;
  minPoints: number;
  maxSalary: number;
  availableTeams: string[];
  remainingBudget: number;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "update:selectedTeam": [value: string];
  "update:minPoints": [value: number];
  "update:maxSalary": [value: number];
  clearAll: [];
}>();

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});
</script>
