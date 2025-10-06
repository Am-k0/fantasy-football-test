<template>
  <div class="w-[700px]">
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
              variant="outline"
              icon="i-heroicons-funnel"
              class="border-gray-300"
              @click="drawerOpen = true"
            >
              Filters
              <span
                v-if="activeFiltersCount > 0"
                class="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full"
              >
                {{ activeFiltersCount }}
              </span>
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
              ${{ row.original.salary.toLocaleString() }}
            </span>
          </template>

          <template #fantasyPoints-cell="{ row }">
            <span class="font-semibold text-purple-600">
              {{ Math.round(row.original.fantasyPoints) }}
            </span>
          </template>

          <template #action-cell="{ row }">
            <UButton
              :disabled="!canSelectPlayer(row.original)"
              :class="
                canSelectPlayer(row.original)
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              "
              size="sm"
              @click="handleAssignPlayer(row.original)"
            >
              {{ getSelectButtonText(row.original) }}
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
import { ref, computed, watch } from "vue";
import {
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Player, Slot } from "~/types/team";

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
  const positionPlayers = props.allPlayers.filter((p) => {
    if (props.activeSlot.type === "FLEX") {
      return ["RB", "WR", "TE"].includes(p.position);
    }
    return p.position === props.activeSlot.type;
  });

  const teams = positionPlayers
    .map((p) => p.team)
    .filter((team): team is string => team !== null);
  return Array.from(new Set(teams)).sort();
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

const countPlayersFromTeam = (teamName: string | null): number => {
  if (!teamName) return 0;
  return props.rosterSlots.filter(
    (slot) =>
      slot.player &&
      slot.player.team === teamName &&
      slot.id !== props.activeSlot.id
  ).length;
};

const canAffordPlayer = (player: Player): boolean => {
  const playerSalary = player.salary;
  const currentSlotSalary = props.activeSlot.player?.salary ?? 0;
  return props.remainingBudget + currentSlotSalary >= playerSalary;
};

const canSelectPlayer = (player: Player): boolean => {
  if (!player.team) return canAffordPlayer(player);
  const withinTeamLimit = countPlayersFromTeam(player.team) < 2;
  const withinBudget = canAffordPlayer(player);
  return withinTeamLimit && withinBudget;
};

const getSelectButtonText = (player: Player): string => {
  if (!canAffordPlayer(player)) return "Over Budget";
  if (!canSelectPlayer(player)) return "Team Limit";
  return "Select";
};

const filteredPlayers = computed(() => {
  let players = props.allPlayers.filter((p) => {
    let matchesPosition = false;
    if (props.activeSlot.type === "FLEX") {
      matchesPosition = ["RB", "WR", "TE"].includes(p.position);
    } else {
      matchesPosition = p.position === props.activeSlot.type;
    }

    const assignedIds = props.rosterSlots
      .filter(
        (s): s is Slot & { player: Player } =>
          s.player !== null && s.id !== props.activeSlot.id
      )
      .map((s) => s.player.id);

    const notAssigned = !assignedIds.includes(p.id);
    return matchesPosition && notAssigned;
  });

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
  if (!canSelectPlayer(player)) {
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

const columns: TableColumn<Player>[] = [
  { accessorKey: "name", header: "Name", enableSorting: true },
  { accessorKey: "team", header: "Team", enableSorting: true },
  { accessorKey: "salary", header: "Salary", enableSorting: true },
  {
    accessorKey: "fantasyPoints",
    header: "Fantasy Points",
    enableSorting: true,
  },
  { id: "action", header: "Action" },
];
</script>
