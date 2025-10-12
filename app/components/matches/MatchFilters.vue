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
        <!-- Tournament Filter -->
        <div>
          <label
            for="tournament-filter"
            class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            Tournaments
          </label>
          <USelectMenu
            v-model="selectedTournament"
            :items="tournamentOptionsFormatted"
            placeholder="Select tournament"
            by="value"
            @update:model-value="handleTournamentChange"
          />
        </div>

        <!-- Team Filter -->
        <div>
          <label
            for="team-filter"
            class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            Team
          </label>
          <USelectMenu
            v-model="selectedTeam"
            :items="teamOptionsFormatted"
            placeholder="Select team"
            searchable
            by="value"
            @update:model-value="handleTeamChange"
          />
        </div>

        <!-- Channel Filter -->
        <div>
          <label
            for="channel-filter"
            class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            TV Channel
          </label>
          <USelectMenu
            v-model="selectedChannel"
            :items="channelOptionsFormatted"
            placeholder="Select channel"
            by="value"
            @update:model-value="handleChannelChange"
          />
        </div>

        <!-- Stadium Type Filter -->
        <div>
          <label
            for="stadium-filter"
            class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            Stadium Type
          </label>
          <USelectMenu
            v-model="selectedStadiumType"
            :items="stadiumTypeOptionsFormatted"
            placeholder="Stadium type"
            by="value"
            @update:model-value="handleStadiumTypeChange"
          />
        </div>

        <!-- Date Filter -->
        <div>
          <label
            for="date-filter"
            class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            Date
          </label>

          <UPopover>
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-calendar"
              class="w-auto min-w-[150px] justify-between text-left border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 h-[38px]"
            >
              <span class="truncate">
                {{
                  modelDate
                    ? df.format(modelDate.toDate(getLocalTimeZone()))
                    : "Select a date"
                }}
              </span>
            </UButton>

            <template #content>
              <div class="p-2">
                <UCalendar v-model="modelDate" />
              </div>
            </template>
          </UPopover>
        </div>
      </div>
    </div>

    <div
      class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end"
    >
      <UButton
        v-if="isAnyFilterActive"
        color="neutral"
        variant="outline"
        @click="clearFilters"
      >
        <template #leading>
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
        </template>
        Clear filters
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, shallowRef } from "vue";
import type { DateValue } from "@internationalized/date";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import {
  extractTournamentIds,
  extractTeams,
  extractChannels,
  extractStadiumTypes,
} from "~/utils/helpers";

type SelectOption = { label: string; value: string };

interface FiltersType {
  date: string;
  team: string;
  channel: string;
  stadiumType: string;
  slateId: string;
}

const props = defineProps<{
  filters: FiltersType;
  matches?: unknown[];
  isAnyFilterActive: boolean;
}>();

const emit = defineEmits<{
  "update-filters": [filters: FiltersType];
}>();

const localFilters = ref<FiltersType>({
  ...props.filters,
  slateId: props.filters.slateId || "",
});

const selectedTournament = ref<SelectOption | undefined>(undefined);
const selectedTeam = ref<SelectOption | undefined>(undefined);
const selectedChannel = ref<SelectOption | undefined>(undefined);
const selectedStadiumType = ref<SelectOption | undefined>(undefined);

/* --- Date handling using UCalendar --- */
const df = new DateFormatter("en-US", { dateStyle: "medium" });
const modelDate = shallowRef<DateValue | undefined>(
  props.filters.date
    ? new CalendarDate(
        new Date(props.filters.date).getFullYear(),
        new Date(props.filters.date).getMonth() + 1,
        new Date(props.filters.date).getDate()
      )
    : undefined
);

// Watch modelDate changes
watch(modelDate, (date) => {
  if (date && "year" in date && "month" in date && "day" in date) {
    const year = date.year;
    const month = String(date.month).padStart(2, "0");
    const day = String(date.day).padStart(2, "0");
    localFilters.value.date = `${year}-${month}-${day}`;
    emitFilters();
  } else if (!date) {
    localFilters.value.date = "";
    emitFilters();
  }
});

/* --- Filter data --- */
const tournamentOptions = computed(() =>
  extractTournamentIds(props.matches || [])
);
const teamOptions = computed(() => extractTeams(props.matches || []));
const channelOptions = computed(() => extractChannels(props.matches || []));
const stadiumTypeOptions = computed(() =>
  extractStadiumTypes(props.matches || [])
);

const tournamentOptionsFormatted = computed(() =>
  tournamentOptions.value.map((slateId) => ({
    label: `Tournament ${slateId}`,
    value: slateId,
  }))
);

const teamOptionsFormatted = computed(() =>
  teamOptions.value.map((team) => ({
    label: team,
    value: team,
  }))
);

const channelOptionsFormatted = computed(() =>
  channelOptions.value.map((channel) => ({
    label: channel,
    value: channel,
  }))
);

const stadiumTypeOptionsFormatted = computed(() =>
  stadiumTypeOptions.value.map((type) => ({
    label: type,
    value: type,
  }))
);

/* --- Event handlers --- */
const handleTournamentChange = (value: SelectOption | undefined): void => {
  localFilters.value.slateId = value?.value || "";
  emitFilters();
};

const handleTeamChange = (value: SelectOption | undefined): void => {
  localFilters.value.team = value?.value || "";
  emitFilters();
};

const handleChannelChange = (value: SelectOption | undefined): void => {
  localFilters.value.channel = value?.value || "";
  emitFilters();
};

const handleStadiumTypeChange = (value: SelectOption | undefined): void => {
  localFilters.value.stadiumType = value?.value || "";
  emitFilters();
};

const emitFilters = (): void => {
  emit("update-filters", { ...localFilters.value });
};

const clearFilters = (): void => {
  localFilters.value = {
    date: "",
    team: "",
    channel: "",
    stadiumType: "",
    slateId: "",
  };
  selectedTournament.value = undefined;
  selectedTeam.value = undefined;
  selectedChannel.value = undefined;
  selectedStadiumType.value = undefined;
  modelDate.value = undefined;
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
