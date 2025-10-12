<template>
  <div class="w-[720px]">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between flex-wrap gap-4">
          <h2 class="text-xl font-semibold">
            Select player for
            <span class="text-blue-600">{{ activeSlot.label }}</span>
          </h2>
          <div class="flex items-center gap-2">
            <UInput
              v-model="globalFilter"
              icon="i-heroicons-magnifying-glass-20-solid"
              placeholder="Search players"
              class="w-64"
            />
            <UButton
              color="gray"
              variant="outline"
              icon="i-heroicons-funnel"
              :badge="activeFiltersCount > 0 ? activeFiltersCount : undefined"
              @click="drawerOpen = true"
            >
              Filters
            </UButton>
          </div>
        </div>
      </template>

      <TeamBuildFilterDisplay
        :show-team-limit-warning="showTeamLimitWarning"
        :has-active-filters="hasActiveFilters"
        :selected-team="selectedTeam"
        :min-points-filter="minPointsFilter"
        :max-salary-filter="maxSalaryFilter"
        @clear-team="clearTeamFilter"
        @clear-points="clearPointsFilter"
        @clear-salary="clearSalaryFilter"
        @clear-all="clearAllFilters"
      />

      <!-- Active Filters Display -->
      <div
        v-if="hasActiveFilters"
        class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700"
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
              @click="clearTeamFilter"
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
              @click="clearPointsFilter"
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
              @click="clearSalaryFilter"
            >
              <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
            </button>
          </div>

          <UButton
            color="gray"
            variant="ghost"
            size="sm"
            class="ml-2"
            @click="clearAllFilters"
          >
            Clear All
          </UButton>
        </div>
      </div>

      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Loading players...</p>
      </div>

      <div v-else-if="filteredPlayers.length > 0">
        <UTable
          ref="table"
          v-model:sorting="sorting"
          v-model:pagination="pagination"
          :data="searchFilteredPlayers"
          :columns="columns"
          :pagination-options="paginationOptions"
          size="sm"
          class="mb-4"
        >
          <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
              <UAvatar :src="row.original.avatar" size="sm" />
              <div>
                <div class="font-medium">{{ row.original.name }}</div>
                <div class="text-xs text-gray-500">
                  {{ row.original.position }} • {{ row.original.team || "N/A" }}
                </div>
              </div>
            </div>
          </template>

          <template #salary-cell="{ row }">
            <span class="font-semibold text-green-600 dark:text-green-400">
              ${{ formatSalaryNumber(row.original.salary) }}
            </span>
          </template>

          <template #fantasyPoints-cell="{ row }">
            <span class="font-semibold text-purple-600">
              {{ roundFantasyPoints(row.original.fantasyPoints) }}
            </span>
          </template>

          <template #action-cell="{ row }">
            <UButton
              :disabled="!canSelectPlayerCheck(row.original)"
              :class="
                canSelectPlayerCheck(row.original)
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              "
              size="sm"
              @click="handleAssignPlayer(row.original)"
            >
              {{ getButtonText(row.original) }}
            </UButton>
          </template>
        </UTable>
      </div>

      <div
        v-else-if="!loading && filteredPlayers.length === 0"
        class="text-sm text-gray-500 text-center py-8"
      >
        No players available for this position.
      </div>

      <template #footer>
        <div class="flex items-center justify-between px-4 py-3">
          <span class="text-sm text-gray-600 dark:text-gray-300">
            <template v-if="filteredCount > 0">
              Showing {{ startIndex }} to {{ endIndex }} of
              {{ filteredCount }} players
            </template>
            <template v-else> No players found </template>
          </span>
          <UPagination
            v-if="filteredCount > currentPageSize"
            :default-page="currentPage"
            :items-per-page="currentPageSize"
            :total="filteredCount"
            :max="7"
            show-first
            show-last
            @update:page="handlePageChange"
          />
        </div>
      </template>
    </UCard>

    <TeamBuildFilterDrawer
      v-model:open="drawerOpen"
      v-model:selected-team="selectedTeam"
      v-model:min-points="minPointsFilter"
      v-model:max-salary="maxSalaryFilter"
      :available-teams="availableTeams"
      :remaining-budget="remainingBudget"
      @clear-all="clearAllFilters"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from "vue";
import {
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type Column,
  type SortingState,
} from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Player, Slot } from "~/types/team";
import {
  extractTeams,
  filterPlayersByPosition,
  canSelectPlayer,
  getSelectButtonText,
  formatSalaryNumber,
  roundFantasyPoints,
} from "~/utils/helpers";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UIcon = resolveComponent("UIcon");

const props = defineProps<{
  activeSlot: Slot;
  allPlayers: Player[];
  rosterSlots: Slot[];
  remainingBudget: number;
  loading: boolean;
}>();

const emit = defineEmits<{
  assignPlayer: [player: Player];
  teamLimitWarning: [value: boolean];
}>();

interface TableRef {
  tableApi?: {
    getState: () => { pagination: { pageIndex: number; pageSize: number } };
    setGlobalFilter: (value: string) => void;
    setPageIndex: (index: number) => void;
  };
}

const table = ref<TableRef | null>(null);
const globalFilter = ref<string>("");
const drawerOpen = ref(false);
const selectedTeam = ref<string>("");
const minPointsFilter = ref<number>(0);
const maxSalaryFilter = ref<number>(0);
const sorting = ref<SortingState>([{ id: "fantasyPoints", desc: true }]);
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const showTeamLimitWarning = ref(false);

const paginationOptions = {
  getPaginationRowModel: getPaginationRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
};

const availableTeams = computed(() => {
  const positionPlayers = filterPlayersByPosition(
    props.allPlayers,
    props.activeSlot.type,
    []
  );
  return extractTeams(positionPlayers);
});

watch(
  () => props.activeSlot,
  () => {
    selectedTeam.value = "";
    minPointsFilter.value = 0;
    maxSalaryFilter.value = 0;
  }
);

const activeFiltersCount = computed(() => {
  let count = 0;
  if (selectedTeam.value !== "") count++;
  if (minPointsFilter.value > 0) count++;
  if (maxSalaryFilter.value > 0) count++;
  return count;
});

const hasActiveFilters = computed(() => {
  return (
    selectedTeam.value !== "" ||
    minPointsFilter.value > 0 ||
    maxSalaryFilter.value > 0
  );
});

const clearTeamFilter = () => {
  selectedTeam.value = "";
};

const clearPointsFilter = () => {
  minPointsFilter.value = 0;
};

const clearSalaryFilter = () => {
  maxSalaryFilter.value = 0;
};

const clearAllFilters = () => {
  selectedTeam.value = "";
  minPointsFilter.value = 0;
  maxSalaryFilter.value = 0;
};

const canSelectPlayerCheck = (player: Player): boolean => {
  return canSelectPlayer(
    player,
    props.rosterSlots,
    props.remainingBudget,
    props.activeSlot.id
  );
};

const getButtonText = (player: Player): string => {
  return getSelectButtonText(
    player,
    props.rosterSlots,
    props.remainingBudget,
    props.activeSlot.id
  );
};

const filteredPlayers = computed(() => {
  const assignedIds = props.rosterSlots
    .filter(
      (s): s is Slot & { player: Player } =>
        s.player !== null && s.id !== props.activeSlot.id
    )
    .map((s) => s.player.id);

  let players = filterPlayersByPosition(
    props.allPlayers,
    props.activeSlot.type,
    assignedIds
  );

  if (selectedTeam.value !== "") {
    players = players.filter((p) => p.team === selectedTeam.value);
  }

  if (minPointsFilter.value > 0) {
    players = players.filter((p) => p.fantasyPoints >= minPointsFilter.value);
  }

  if (maxSalaryFilter.value > 0) {
    players = players.filter((p) => p.salary <= maxSalaryFilter.value);
  }

  return players;
});

const searchFilteredPlayers = computed(() => {
  if (!globalFilter.value) return filteredPlayers.value;
  return filteredPlayers.value.filter((p) =>
    p.name.toLowerCase().includes(globalFilter.value.toLowerCase())
  );
});

const filteredCount = computed(() => searchFilteredPlayers.value.length);

const currentPage = computed(() => {
  const tableApi = table.value?.tableApi;
  if (!tableApi) return 1;
  return tableApi.getState().pagination.pageIndex + 1;
});

const currentPageSize = computed(() => {
  const tableApi = table.value?.tableApi;
  if (!tableApi) return 10;
  return tableApi.getState().pagination.pageSize;
});

const startIndex = computed(() => {
  const tableApi = table.value?.tableApi;
  if (!tableApi || filteredCount.value === 0) return 0;
  const state = tableApi.getState();
  return state.pagination.pageIndex * state.pagination.pageSize + 1;
});

const endIndex = computed(() => {
  const tableApi = table.value?.tableApi;
  if (!tableApi) return 0;
  const state = tableApi.getState();
  return Math.min(
    (state.pagination.pageIndex + 1) * state.pagination.pageSize,
    filteredCount.value
  );
});

const handlePageChange = (page: number): void => {
  const tableApi = table.value?.tableApi;
  if (tableApi) {
    tableApi.setPageIndex(page - 1);
  }
};

const handleAssignPlayer = (player: Player) => {
  if (!canSelectPlayerCheck(player)) {
    showTeamLimitWarning.value = true;
    emit("teamLimitWarning", true);
    return;
  }
  showTeamLimitWarning.value = false;
  emit("teamLimitWarning", false);
  emit("assignPlayer", player);
};

const resetPage = () => {
  const tableApi = table.value?.tableApi;
  if (tableApi) {
    tableApi.setPageIndex(0);
  }
  globalFilter.value = "";
};

defineExpose({ resetPage });

function getHeader(column: Column<Player>, label: string) {
  const isSorted = column.getIsSorted();

  return h(
    UDropdownMenu,
    {
      content: {
        align: "start" as const,
      },
      "aria-label": "Sort options",
      items: [
        {
          label: "Asc",
          type: "checkbox" as const,
          icon: "i-lucide-arrow-up-narrow-wide",
          checked: isSorted === "asc",
          onSelect: () => {
            if (isSorted === "asc") {
              column.clearSorting();
            } else {
              column.toggleSorting(false);
            }
          },
        },
        {
          label: "Desc",
          icon: "i-lucide-arrow-down-wide-narrow",
          type: "checkbox" as const,
          checked: isSorted === "desc",
          onSelect: () => {
            if (isSorted === "desc") {
              column.clearSorting();
            } else {
              column.toggleSorting(true);
            }
          },
        },
      ],
    },
    () =>
      h(UButton, {
        color: "gray" as const,
        variant: "ghost" as const,
        label,
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5 data-[state=open]:bg-elevated",
        "aria-label": `Sort by ${
          isSorted === "asc" ? "descending" : "ascending"
        }`,
      })
  );
}

const columns: TableColumn<Player>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => getHeader(column, "Name"),
    enableSorting: true,
  },
  {
    accessorKey: "team",
    header: ({ column }) => getHeader(column, "Team"),
    enableSorting: true,
  },
  {
    accessorKey: "salary",
    header: ({ column }) => getHeader(column, "Salary"),
    enableSorting: true,
  },
  {
    accessorKey: "fantasyPoints",
    header: ({ column }) => getHeader(column, "Fantasy Points"),
    enableSorting: true,
  },
  { id: "action", header: "Action" },
];
</script>
