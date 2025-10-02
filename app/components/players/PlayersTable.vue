<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between flex-wrap gap-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Players List
        </h3>
        <div class="flex items-center gap-4 flex-wrap">
          <UInput
            v-model="globalFilter"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Search players"
            class="w-64"
          />

          <UDrawer
            v-model:open="filterDrawerOpen"
            direction="right"
            :ui="{ content: 'min-w-55', overlay: 'bg-black/30' }"
          >
            <UButton
              color="gray"
              variant="outline"
              icon="i-heroicons-funnel"
              label="Filters"
              :badge="activeFiltersCount > 0 ? activeFiltersCount : undefined"
              @click="filterDrawerOpen = true"
            />

            <template #content>
              <div class="p-6 space-y-6">
                <div class="flex items-center justify-between">
                  <h3
                    class="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    Filter Players
                  </h3>
                  <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-x-mark"
                    size="sm"
                    @click="filterDrawerOpen = false"
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
                      v-model="teamFilter"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select team...</option>
                      <option
                        v-for="team in uniqueTeams"
                        :key="team"
                        :value="team"
                      >
                        {{ team }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Position
                    </label>
                    <select
                      v-model="positionFilter"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select position...</option>
                      <option
                        v-for="position in uniquePositions"
                        :key="position"
                        :value="position"
                      >
                        {{ position }}
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
                      v-model.number="pointsFilter"
                      type="number"
                      placeholder="Enter minimum points..."
                      class="w-full"
                    />
                  </div>
                </div>

                <div
                  class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <UButton
                    color="gray"
                    variant="outline"
                    class="flex-1"
                    @click="clearAllFilters"
                  >
                    Clear All
                  </UButton>
                  <UButton
                    color="primary"
                    class="flex-1"
                    @click="filterDrawerOpen = false"
                  >
                    Apply Filters
                  </UButton>
                </div>
              </div>
            </template>
          </UDrawer>
        </div>
      </div>
    </template>

    <div
      v-if="hasActiveFilters"
      class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Active filters:
        </span>

        <div
          v-if="teamFilter"
          class="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
        >
          <span>Team: {{ teamFilter }}</span>
          <button
            class="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
            @click="clearTeamFilter"
          >
            <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
          </button>
        </div>

        <div
          v-if="positionFilter"
          class="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
        >
          <span>Position: {{ positionFilter }}</span>
          <button
            class="ml-1 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
            @click="clearPositionFilter"
          >
            <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
          </button>
        </div>

        <div
          v-if="pointsFilter > 0"
          class="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm"
        >
          <span>Points: {{ pointsFilter }}+</span>
          <button
            class="ml-1 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100"
            @click="clearPointsFilter"
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

    <UTable
      ref="table"
      v-model:sorting="sorting"
      v-model:pagination="pagination"
      :data="searchAndFilteredPlayers"
      :columns="columns"
      :loading="status === 'pending'"
      :pagination-options="paginationOptions"
      sticky
      class="w-full"
    />

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
          v-if="filteredCount > 0"
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
</template>

<script setup lang="ts">
import {
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type Column,
  type SortingState,
} from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import { NuxtLink } from "#components";
import { ref, h, onMounted, computed, type VNode } from "vue";

const UAvatar = resolveComponent("UAvatar");
const UIcon = resolveComponent("UIcon");
const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

// Data types from API
interface DfsSlatePlayer {
  playerId: number;
  operatorPlayerName: string;
  operatorPosition: string;
  team: string | null;
  fantasyPoints?: number;
}

interface Slate {
  dfsSlatePlayers: DfsSlatePlayer[];
}

interface TableRef {
  tableApi?: {
    getState: () => {
      pagination: {
        pageIndex: number;
        pageSize: number;
      };
    };
    setGlobalFilter: (value: string) => void;
    setPageIndex: (index: number) => void;
  };
}

const table = ref<TableRef | null>(null);

type Player = {
  id: number;
  name: string;
  position: string;
  team: string | null;
  avatar?: string;
  fantasyPoints?: number;
};

const status = ref<string>("idle");
const players = ref<Player[]>([]);
const globalFilter = ref<string>("");

const filterDrawerOpen = ref<boolean>(false);

const teamFilter = ref<string>("");
const positionFilter = ref<string>("");
const pointsFilter = ref<number>(0);

const sorting = ref<SortingState>([
  {
    id: "fantasyPoints",
    desc: true,
  },
]);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const paginationOptions = {
  getPaginationRowModel: getPaginationRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
};

function getHeader(column: Column<Player>, label: string): VNode {
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
        color: "neutral" as const,
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

const uniqueTeams = computed(() => {
  return Array.from(
    new Set(players.value.map((p) => p.team).filter((t): t is string => !!t))
  );
});

const uniquePositions = computed(() => {
  return Array.from(new Set(players.value.map((p) => p.position)));
});

const hasActiveFilters = computed(() => {
  return (
    teamFilter.value !== "" ||
    positionFilter.value !== "" ||
    pointsFilter.value > 0
  );
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (teamFilter.value !== "") count++;
  if (positionFilter.value !== "") count++;
  if (pointsFilter.value > 0) count++;
  return count;
});

const filteredPlayers = computed(() => {
  return players.value.filter((p) => {
    const matchesTeam = teamFilter.value === "" || p.team === teamFilter.value;
    const matchesPosition =
      positionFilter.value === "" || p.position === positionFilter.value;
    const matchesPoints =
      pointsFilter.value === 0 || (p.fantasyPoints ?? 0) >= pointsFilter.value;
    return matchesTeam && matchesPosition && matchesPoints;
  });
});

const searchAndFilteredPlayers = computed(() => {
  if (!globalFilter.value) return filteredPlayers.value;
  return filteredPlayers.value.filter((p) =>
    p.name.toLowerCase().includes(globalFilter.value.toLowerCase())
  );
});

const filteredCount = computed(() => searchAndFilteredPlayers.value.length);

const clearTeamFilter = (): void => {
  teamFilter.value = "";
};

const clearPositionFilter = (): void => {
  positionFilter.value = "";
};

const clearPointsFilter = (): void => {
  pointsFilter.value = 0;
};

const clearAllFilters = (): void => {
  teamFilter.value = "";
  positionFilter.value = "";
  pointsFilter.value = 0;
  sorting.value = [
    {
      id: "fantasyPoints",
      desc: true,
    },
  ];
};

const currentPage = computed(() => {
  if (!table.value?.tableApi) return 1;
  return table.value.tableApi.getState().pagination.pageIndex + 1;
});

const currentPageSize = computed(() => {
  if (!table.value?.tableApi) return 10;
  return table.value.tableApi.getState().pagination.pageSize;
});

const startIndex = computed(() => {
  if (!table.value?.tableApi) return 0;
  if (filteredCount.value === 0) return 0;
  const pageIndex = table.value.tableApi.getState().pagination.pageIndex;
  const pageSize = table.value.tableApi.getState().pagination.pageSize;
  return pageIndex * pageSize + 1;
});

const endIndex = computed(() => {
  if (!table.value?.tableApi) return 0;
  const pageIndex = table.value.tableApi.getState().pagination.pageIndex;
  const pageSize = table.value.tableApi.getState().pagination.pageSize;
  return Math.min((pageIndex + 1) * pageSize, filteredCount.value);
});

const handlePageChange = (page: number): void => {
  if (table.value?.tableApi) {
    table.value.tableApi.setPageIndex(page - 1);
  }
};

onMounted(async () => {
  status.value = "pending";
  try {
    const res = await fetch("/data.json");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const json: Slate[] = await res.json();

    const allPlayers = json.flatMap((slate) =>
      slate.dfsSlatePlayers.map((p) => ({
        id: p.playerId,
        name: p.operatorPlayerName,
        position: p.operatorPosition,
        team: p.team || null,
        avatar: "/images/player.png",
        fantasyPoints: p.fantasyPoints ?? 0,
      }))
    );

    const uniquePlayersMap = new Map<number, Player>();
    allPlayers.forEach((player: Player) => {
      if (!uniquePlayersMap.has(player.id))
        uniquePlayersMap.set(player.id, player);
    });

    players.value = Array.from(uniquePlayersMap.values());
    status.value = "done";
  } catch (e) {
    console.error("Failed to fetch player data:", e);
    status.value = "error";
  }
});

const columns: TableColumn<Player>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => getHeader(column, "Name"),
    cell: ({ row }) =>
      h(
        NuxtLink,
        {
          to: `/players/${row.original.id}`,
          class: "flex items-center space-x-3 hover:opacity-80",
        },
        () => [
          h(UAvatar, {
            src: row.original.avatar,
            alt: row.original.name,
            size: "xl" as const,
          }),
          h(
            "span",
            { class: "font-semibold text-gray-900 dark:text-white" },
            row.original.name
          ),
        ]
      ),
  },
  {
    accessorKey: "position",
    header: ({ column }) => getHeader(column, "Position"),
    cell: ({ row }) =>
      h(
        "span",
        { class: "font-medium text-blue-600 dark:text-blue-400" },
        row.original.position
      ),
  },
  {
    accessorKey: "team",
    header: ({ column }) => getHeader(column, "Team"),
    cell: ({ row }) =>
      row.original.team
        ? h(
            "span",
            { class: "text-gray-600 dark:text-gray-300 font-medium" },
            row.original.team
          )
        : h(
            "div",
            {
              class: "flex items-center gap-2 text-gray-500 dark:text-gray-400",
            },
            [h(UIcon, { name: "i-heroicons-no-symbol", class: "h-4 w-4" })]
          ),
  },
  {
    accessorKey: "fantasyPoints",
    header: ({ column }) => getHeader(column, "Fantasy Points"),
    cell: ({ row }) =>
      h(
        "span",
        { class: "font-semibold text-purple-600 dark:text-purple-400" },
        (row.original.fantasyPoints ?? 0).toString()
      ),
  },
];
</script>
