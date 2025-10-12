<template>
  <div class="p-8">
    <div class="text-center mb-6">
      <div class="flex items-center justify-center gap-2">
        <UIcon name="i-mdi-football" class="text-3xl text-primary-500" />
        <h1 class="text-3xl font-bold">Football Fantasy — Create Your Team</h1>
      </div>

      <p class="text-xs text-gray-600 mt-2">
        Click a position on the field to pick a player
      </p>
    </div>

    <!-- Message if user is not logged in -->
    <div v-if="!user" class="max-w-2xl mx-auto">
      <UCard>
        <div class="text-center py-12">
          <div class="mb-6">
            <UIcon
              name="i-heroicons-lock-closed"
              class="h-16 w-16 mx-auto text-blue-500"
            />
          </div>

          <h2 class="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
            Authentication Required
          </h2>

          <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            To create your team, you must be logged in first. Please log in to
            your account or create a new one to start building your fantasy
            team.
          </p>

          <div class="flex gap-4 justify-center">
            <UButton
              size="lg"
              class="bg-blue-600 hover:bg-blue-700 text-white"
              icon="i-heroicons-arrow-right-on-rectangle"
              @click="router.push('/login')"
            >
              Log In
            </UButton>

            <UButton
              size="lg"
              variant="outline"
              icon="i-heroicons-user-plus"
              @click="router.push('/signup')"
            >
              Sign Up
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Team builder - shows only if user is logged in -->
    <div v-else>
      <!-- Loading State -->
      <div v-if="loadingTeam" class="flex justify-center items-center h-64">
        <UButton loading size="lg" color="primary" variant="ghost">
          Loading your team...
        </UButton>
      </div>

      <div v-else class="flex gap-6 justify-center">
        <TeamBuildField
          :roster-slots="rosterSlots"
          :remaining-budget="remainingBudget"
          :total-budget="TOTAL_BUDGET"
          :total-fantasy-points="totalFantasyPoints"
          :team-saved="teamSaved"
          :is-editing="isEditing"
          :show-success-message="showSuccessMessage"
          :is-team-complete="isTeamComplete"
          @slot-click="handleSlotInteraction"
          @remove-player="removePlayer"
          @save-team="saveOrUpdateTeam"
          @edit-team="editTeam"
          @delete-team="openDeleteModal"
        />

        <TeamBuildPlayerSelector
          v-if="activeSlot && (!teamSaved || isEditing)"
          ref="playerSelector"
          :active-slot="activeSlot"
          :all-players="allPlayers"
          :roster-slots="rosterSlots"
          :remaining-budget="remainingBudget"
          :loading="loading"
          @assign-player="assignPlayer"
          @team-limit-warning="showTeamLimitWarning = $event"
        />
      </div>

      <UModal
        v-model:open="deleteModalOpen"
        title="Delete Confirmation"
        description="Are you sure you want to delete your entire team?"
        :ui="{ footer: 'justify-end' }"
      >
        <template #footer="{ close }">
          <UButton label="Cancel" variant="outline" @click="close" />
          <UButton
            label="Delete"
            class="bg-red-600 hover:bg-red-700 text-white"
            @click="confirmDeleteTeam(close)"
          />
        </template>
      </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useSupabaseAuth } from "~/composables/useSupabaseAuth";
import { useTeam } from "~/composables/useTeam";
import type { Player, Slot } from "~/types/team";
import {
  extractPlayersFromTournaments,
  filterValidPositions,
  calculateCurrentBudget,
  calculateRemainingBudget,
  calculateTotalFantasyPoints,
  isTeamComplete as checkTeamComplete,
} from "~/utils/helpers";

definePageMeta({
  layout: "default",
});

const router = useRouter();
const playerSelector = ref();
const { user, init } = useSupabaseAuth();
const { loadTeam, saveTeam, deleteTeam: deleteTeamFromDb } = useTeam();

await init();

const loading = ref<boolean>(true);
const loadingTeam = ref<boolean>(true);
const allPlayers = ref<Player[]>([]);
const showTeamLimitWarning = ref<boolean>(false);
const teamSaved = ref(false);
const isEditing = ref(false);
const showSuccessMessage = ref(false);
const deleteModalOpen = ref(false);

const TOTAL_BUDGET = 100000;

const defaultMainRosterSlots: Slot[] = [
  {
    id: 1,
    label: "QB",
    type: "QB",
    x: 50,
    y: 43,
    player: null,
    isBench: false,
  },
  {
    id: 2,
    label: "RB",
    type: "RB",
    x: 25,
    y: 53,
    player: null,
    isBench: false,
  },
  {
    id: 3,
    label: "RB",
    type: "RB",
    x: 50,
    y: 53,
    player: null,
    isBench: false,
  },
  {
    id: 4,
    label: "WR",
    type: "WR",
    x: 75,
    y: 53,
    player: null,
    isBench: false,
  },
  {
    id: 5,
    label: "TE",
    type: "TE",
    x: 50,
    y: 63,
    player: null,
    isBench: false,
  },
  {
    id: 6,
    label: "DEF",
    type: "DEF",
    x: 25,
    y: 73,
    player: null,
    isBench: false,
  },
  {
    id: 7,
    label: "TE",
    type: "TE",
    x: 50,
    y: 73,
    player: null,
    isBench: false,
  },
  {
    id: 8,
    label: "DST",
    type: "DEF",
    x: 75,
    y: 73,
    player: null,
    isBench: false,
  },
  { id: 9, label: "K", type: "K", x: 50, y: 83, player: null, isBench: false },
];

const benchY = 95;
const benchSlots: Slot[] = [
  {
    id: 10,
    label: "B - QB",
    type: "QB",
    x: 10,
    y: benchY,
    player: null,
    isBench: true,
  },
  {
    id: 11,
    label: "B - RB",
    type: "RB",
    x: 30,
    y: benchY,
    player: null,
    isBench: true,
  },
  {
    id: 12,
    label: "B - WR",
    type: "WR",
    x: 50,
    y: benchY,
    player: null,
    isBench: true,
  },
  {
    id: 13,
    label: "B - TE",
    type: "TE",
    x: 70,
    y: benchY,
    player: null,
    isBench: true,
  },
  {
    id: 14,
    label: "B - FLEX",
    type: "FLEX",
    x: 90,
    y: benchY,
    player: null,
    isBench: true,
  },
];

const allRosterSlots = computed(() => [
  ...defaultMainRosterSlots,
  ...benchSlots,
]);
const rosterSlots = ref<Slot[]>([
  ...allRosterSlots.value.map((s) => ({ ...s })),
]);
const activeSlot = ref<Slot | null>(null);

const currentBudget = computed(() => calculateCurrentBudget(rosterSlots.value));
const remainingBudget = computed(() =>
  calculateRemainingBudget(TOTAL_BUDGET, currentBudget.value)
);
const totalFantasyPoints = computed(() =>
  calculateTotalFantasyPoints(rosterSlots.value)
);
const isTeamComplete = computed(() =>
  checkTeamComplete(rosterSlots.value, remainingBudget.value)
);

const fetchPlayersData = async (): Promise<Player[]> => {
  try {
    const res = await fetch("/data.json");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();

    const players = extractPlayersFromTournaments(json);
    return filterValidPositions(players);
  } catch (e) {
    console.error("Failed to fetch player data:", e);
    return [];
  }
};

const resetTeam = () => {
  rosterSlots.value = [...allRosterSlots.value.map((s) => ({ ...s }))];
  teamSaved.value = false;
  isEditing.value = false;
  activeSlot.value = null;
  showTeamLimitWarning.value = false;
};

const loadPlayersAndTeam = async () => {
  loading.value = true;
  loadingTeam.value = true;

  allPlayers.value = await fetchPlayersData();
  loading.value = false;

  if (user.value) {
    const savedTeam = await loadTeam(user.value.id);

    if (savedTeam && savedTeam.players && Array.isArray(savedTeam.players)) {
      rosterSlots.value = rosterSlots.value.map((slot) => {
        const savedSlot = savedTeam.players.find((s: Slot) => s.id === slot.id);
        if (savedSlot && savedSlot.player) {
          const fullPlayer: Player =
            allPlayers.value.find((ap) => ap.id === savedSlot.player?.id) ||
            savedSlot.player;

          return {
            ...slot,
            player: fullPlayer,
            label: savedSlot.label || slot.label,
          };
        }
        return slot;
      });
      teamSaved.value = true;
      isEditing.value = false;
    } else {
      resetTeam();
    }
  }

  loadingTeam.value = false;
};

onMounted(() => {
  loadPlayersAndTeam();
});

const saveOrUpdateTeam = async () => {
  if (!isTeamComplete.value || !user.value) return;

  try {
    await saveTeam(user.value.id, rosterSlots.value, currentBudget.value);

    teamSaved.value = true;
    isEditing.value = false;
    activeSlot.value = null;

    showSuccessMessage.value = true;
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 3000);
  } catch (e) {
    console.error("Error saving team:", e);
    alert("Failed to save team. Please try again.");
  }
};

const editTeam = () => {
  isEditing.value = true;
};

const deleteTeamAction = async () => {
  if (!user.value) return;

  try {
    await deleteTeamFromDb(user.value.id);
    resetTeam();
  } catch (e) {
    console.error("Error deleting team:", e);
    alert("Failed to delete team. Please try again.");
  }
};

const openDeleteModal = () => {
  deleteModalOpen.value = true;
};

const confirmDeleteTeam = async (closeModal: () => void) => {
  await deleteTeamAction();
  closeModal();
};

const handleSlotInteraction = (slot: Slot) => {
  if (teamSaved.value && !isEditing.value && slot.player) {
    router.push(`/players/${slot.player.id}`);
  } else {
    activeSlot.value = slot;
    showTeamLimitWarning.value = false;
    if (playerSelector.value) {
      playerSelector.value.resetPage();
    }
  }
};

const assignPlayer = (player: Player) => {
  const currentSlot = activeSlot.value;
  if (!currentSlot || (teamSaved.value && !isEditing.value)) return;

  const idx = rosterSlots.value.findIndex((s) => s.id === currentSlot.id);
  if (idx < 0) return;

  const targetSlot = rosterSlots.value[idx];
  if (!targetSlot) return;

  if (currentSlot.type === "FLEX") {
    if (!["RB", "WR", "TE"].includes(player.position)) return;
    targetSlot.label = `B - ${player.position}`;
  } else if (currentSlot.type !== player.position) {
    return;
  }

  targetSlot.player = player;
  activeSlot.value = targetSlot;
  showTeamLimitWarning.value = false;
};

const removePlayer = (slot: Slot) => {
  if (teamSaved.value && !isEditing.value) return;

  const idx = rosterSlots.value.findIndex((s) => s.id === slot.id);
  if (idx === -1) return;

  const targetSlot = rosterSlots.value[idx];
  if (!targetSlot) return;

  if (targetSlot.isBench && targetSlot.type === "FLEX") {
    targetSlot.label = "B - FLEX";
  }
  targetSlot.player = null;

  const currentSlot = activeSlot.value;
  if (currentSlot && currentSlot.id === slot.id) {
    activeSlot.value = targetSlot;
  }

  showTeamLimitWarning.value = false;
};
</script>
