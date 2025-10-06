<template>
  <div class="p-8">
    <div class="text-center mb-6">
      <div class="flex items-center justify-center gap-2">
        <UIcon name="i-mdi-football" class="text-3xl text-primary-500" />
        <h1 class="text-2xl font-bold">Football Fantasy — Create Your Team</h1>
      </div>

      <p class="text-xs text-gray-600">
        Click a position on the field to pick a player
      </p>
    </div>

    <div class="flex gap-6 justify-center">
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
      title="Potvrda brisanja"
      description="Da li ste sigurni da želite da obrišete ceo tim?"
      :ui="{ footer: 'justify-end' }"
    >
      <template #footer="{ close }">
        <UButton label="Otkaži" variant="outline" @click="close" />
        <UButton
          label="Obriši"
          class="bg-red-600 hover:bg-red-700 text-white"
          @click="confirmDeleteTeam(close)"
        />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { Player, Slot } from "~/types/team";

const router = useRouter();
const playerSelector = ref();

const loading = ref<boolean>(true);
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

const currentBudget = computed(() => {
  return rosterSlots.value.reduce(
    (sum, slot) => sum + (slot.player?.salary ?? 0),
    0
  );
});

const remainingBudget = computed(() => TOTAL_BUDGET - currentBudget.value);

const totalFantasyPoints = computed(() => {
  return rosterSlots.value.reduce(
    (sum, slot) => sum + (slot.player?.fantasyPoints ?? 0),
    0
  );
});

const isTeamComplete = computed(() => {
  const allSlotsFilled = rosterSlots.value.every(
    (slot) => slot.player !== null
  );
  const withinBudget = remainingBudget.value >= 0;
  return allSlotsFilled && withinBudget;
});

interface DfsSlatePlayer {
  playerId: number;
  operatorPlayerName: string;
  operatorPosition: string;
  team: string | null;
  fantasyPoints?: number;
  operatorSalary?: number;
}

interface Slate {
  dfsSlatePlayers: DfsSlatePlayer[];
}

const fetchPlayersData = async (): Promise<Player[]> => {
  try {
    const res = await fetch("/data.json");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json: Slate[] = await res.json();

    const players = json.flatMap((slate) =>
      slate.dfsSlatePlayers.map((p) => ({
        id: p.playerId,
        name: p.operatorPlayerName,
        position: p.operatorPosition === "DST" ? "DEF" : p.operatorPosition,
        team: p.team || null,
        avatar: "/images/player.png",
        fantasyPoints: p.fantasyPoints ?? 0,
        salary: p.operatorSalary ?? 0,
      }))
    );

    const uniquePlayersMap = new Map<number, Player>();
    players.forEach((player: Player) => {
      if (!player.position) return;
      if (
        ["QB", "RB", "WR", "TE", "DEF", "K"].includes(player.position) &&
        !uniquePlayersMap.has(player.id)
      ) {
        uniquePlayersMap.set(player.id, player);
      }
    });

    return Array.from(uniquePlayersMap.values());
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
  allPlayers.value = await fetchPlayersData();
  loading.value = false;

  const saved = localStorage.getItem("fantasyTeam");
  if (saved) {
    try {
      const savedData = JSON.parse(saved) as {
        players?: Array<{
          slotId: number;
          playerId: number;
          playerName: string;
          team: string | null;
          position: string;
          fantasyPoints: number;
          salary: number;
        }>;
      };

      if (savedData.players && Array.isArray(savedData.players)) {
        rosterSlots.value = rosterSlots.value.map((slot) => {
          const savedPlayer = savedData.players?.find(
            (p) => p.slotId === slot.id
          );
          if (savedPlayer) {
            const fullPlayer: Player = allPlayers.value.find(
              (ap) => ap.id === savedPlayer.playerId
            ) || {
              id: savedPlayer.playerId,
              name: savedPlayer.playerName,
              team: savedPlayer.team,
              position: savedPlayer.position.replace("B - ", "").trim(),
              avatar: "/images/player.png",
              fantasyPoints: savedPlayer.fantasyPoints,
              salary: savedPlayer.salary,
            };

            return { ...slot, player: fullPlayer, label: savedPlayer.position };
          }
          return slot;
        });
        teamSaved.value = true;
        isEditing.value = false;
      } else {
        localStorage.removeItem("fantasyTeam");
        resetTeam();
      }
    } catch {
      localStorage.removeItem("fantasyTeam");
      resetTeam();
    }
  } else {
    resetTeam();
  }
};

onMounted(() => {
  loadPlayersAndTeam();
});

const saveOrUpdateTeam = () => {
  if (!isTeamComplete.value) return;

  const teamData = {
    players: rosterSlots.value
      .filter((slot): slot is Slot & { player: Player } => slot.player !== null)
      .map((slot) => ({
        slotId: slot.id,
        position: slot.label,
        playerId: slot.player.id,
        playerName: slot.player.name,
        team: slot.player.team,
        fantasyPoints: Math.round(slot.player.fantasyPoints),
        salary: slot.player.salary,
      })),
    totalBudget: currentBudget.value,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem("fantasyTeam", JSON.stringify(teamData));
  teamSaved.value = true;
  isEditing.value = false;
  activeSlot.value = null;

  showSuccessMessage.value = true;
  setTimeout(() => {
    showSuccessMessage.value = false;
  }, 3000);
};

const editTeam = () => {
  isEditing.value = true;
};

const deleteTeam = () => {
  localStorage.removeItem("fantasyTeam");
  resetTeam();
};

const openDeleteModal = () => {
  deleteModalOpen.value = true;
};

const confirmDeleteTeam = (closeModal: () => void) => {
  deleteTeam();
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
