<template>
  <UDrawer
    v-model:open="isOpen"
    direction="right"
    :ui="{ content: 'min-w-[320px]', overlay: 'bg-black/30' }"
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
            <USelectMenu
              v-model="selectedTeamOption"
              :items="teamOptionsFormatted"
              placeholder="Select team..."
              searchable
              searchable-placeholder="Search teams..."
              by="value"
              class="w-full"
              @update:model-value="handleTeamChange"
            />
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
          <UButton variant="outline" class="flex-1" @click="handleClearAll">
            Clear All
          </UButton>
          <UButton color="primary" class="flex-1" @click="isOpen = false">
            Apply Filters
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { formatSalaryNumber } from "~/utils/helpers";

type SelectOption = { label: string; value: string };

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

const selectedTeamOption = ref<SelectOption | undefined>(undefined);

const teamOptionsFormatted = computed(() =>
  props.availableTeams.map((team) => ({
    label: team,
    value: team,
  }))
);

const handleTeamChange = (value: SelectOption | undefined): void => {
  emit("update:selectedTeam", value?.value || "");
};

const handleClearAll = (): void => {
  selectedTeamOption.value = undefined;
  emit("clearAll");
};

// Sync selectedTeam prop with local selectedTeamOption
watch(
  () => props.selectedTeam,
  (newValue) => {
    if (newValue === "") {
      selectedTeamOption.value = undefined;
    } else {
      selectedTeamOption.value = teamOptionsFormatted.value.find(
        (opt) => opt.value === newValue
      );
    }
  },
  { immediate: true }
);
</script>
