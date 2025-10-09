<template>
  <div>
    <div
      class="relative bg-gray-100 rounded-lg shadow-md overflow-hidden max-w-3xl"
    >
      <img src="/images/team.png" alt="field" class="w-full block" />

      <div
        class="absolute bottom-[85%] left-1/2 transform -translate-x-1/2 z-30 w-auto flex flex-col items-center gap-2 text-white font-semibold text-lg select-none"
      >
        <div
          v-if="!teamSaved || isEditing"
          class="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg"
        >
          <UIcon name="i-lucide-wallet" class="h-5 w-5 text-green-400" />
          <span>
            Budget:
            <span
              :class="remainingBudget < 0 ? 'text-red-400' : 'text-green-400'"
            >
              ${{ formatSalaryNumber(remainingBudget) }}
            </span>
            / ${{ formatSalaryNumber(totalBudget) }}
          </span>
        </div>

        <div class="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg">
          <UIcon name="i-lucide-star" class="h-5 w-5 text-yellow-400" />
          <span>
            Total Fantasy Points:
            <span class="text-purple-400">{{
              roundFantasyPoints(totalFantasyPoints)
            }}</span>
          </span>
        </div>
      </div>

      <div class="absolute inset-0 pointer-events-none">
        <div
          class="absolute text-white font-bold text-lg pointer-events-none"
          :style="{
            left: '10%',
            top: '90.5%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
          }"
        >
          BENCH:
        </div>

        <div
          v-for="slot in rosterSlots"
          :key="slot.id"
          :style="slotStyle(slot)"
          :title="slot.isBench ? 'Bench Slot' : 'Main Roster Slot'"
          class="absolute pointer-events-auto"
        >
          <UCard
            :class="[
              slot.player
                ? 'bg-white/95 hover:scale-[1.07]'
                : 'bg-white/80 hover:scale-105',
              teamSaved && !isEditing
                ? 'cursor-pointer hover:shadow-lg'
                : 'cursor-default',
              slot.isBench ? 'border-2 border-dashed border-gray-400/50' : '',
            ]"
            class="w-28 h-16 flex items-center justify-center cursor-pointer transform transition"
            @click="$emit('slotClick', slot)"
          >
            <div
              :class="{ 'text-gray-900': !teamSaved || isEditing }"
              class="text-center w-full"
            >
              <div v-if="slot.player" class="text-xs">
                <p
                  :class="{
                    'text-blue-600 hover:underline': teamSaved && !isEditing,
                    'text-gray-900': !teamSaved || isEditing,
                  }"
                  class="font-semibold whitespace-normal break-words leading-tight"
                >
                  {{ slot.player.name }}
                </p>
                <p
                  :class="{
                    'text-[10px]': true,
                    'text-gray-500': teamSaved && !isEditing,
                    'text-gray-900': !teamSaved || isEditing,
                  }"
                >
                  {{ slot.player.team }}
                </p>
                <p
                  v-if="!teamSaved || isEditing"
                  class="text-[10px] text-green-600 font-bold mt-0.5"
                >
                  ${{ formatSalaryNumber(slot.player.salary) }}
                </p>
              </div>

              <div
                v-else
                :class="{ 'text-gray-900': !teamSaved || isEditing }"
                class="font-bold text-sm"
              >
                {{ slot.label }}
              </div>
            </div>

            <button
              v-if="slot.player && (!teamSaved || isEditing)"
              title="Remove player"
              class="absolute -right-2 -top-2 bg-white rounded-full p-0.5 shadow pointer-events-auto"
              @click.stop="$emit('removePlayer', slot)"
            >
              <UIcon name="i-lucide-x" class="h-4 w-4 text-red-600" />
            </button>
          </UCard>
        </div>
      </div>

      <div
        v-if="remainingBudget < 0 && (!teamSaved || isEditing)"
        class="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto z-30 bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg font-semibold shadow-xl"
      >
        <UIcon name="i-lucide-alert-circle" class="h-5 w-5 mr-2" />
        Prešli ste budžet! Uklonite igrače.
      </div>

      <div
        v-if="showSuccessMessage"
        class="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto z-30 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg font-semibold shadow-xl"
      >
        <UIcon name="i-lucide-check-circle" class="h-5 w-5 mr-2" />
        Tim je uspješno sačuvan!
      </div>
    </div>

    <div class="flex gap-4 justify-center mt-6">
      <div v-if="teamSaved && !isEditing" class="flex gap-4">
        <UButton
          size="lg"
          class="shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
          @click="$emit('editTeam')"
        >
          <template #leading>
            <UIcon name="i-lucide-edit" class="h-5 w-5" />
          </template>
          Edit Team
        </UButton>
        <UButton
          variant="outline"
          size="lg"
          class="shadow-lg border-red-600 text-red-600 hover:bg-red-50"
          @click="$emit('deleteTeam')"
        >
          <template #leading>
            <UIcon name="i-lucide-trash-2" class="h-5 w-5" />
          </template>
          Izbriši Tim
        </UButton>
      </div>

      <UButton
        v-if="!teamSaved || isEditing"
        :disabled="!isTeamComplete"
        size="lg"
        class="shadow-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        @click="$emit('saveTeam')"
      >
        <template #leading>
          <UIcon name="i-lucide-save" class="h-5 w-5" />
        </template>
        {{ isEditing ? "Sačuvaj izmjene" : "Sačuvaj Tim" }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Slot } from "~/types/team";
import { formatSalaryNumber, roundFantasyPoints } from "~/utils/helpers";

defineProps<{
  rosterSlots: Slot[];
  remainingBudget: number;
  totalBudget: number;
  totalFantasyPoints: number;
  teamSaved: boolean;
  isEditing: boolean;
  showSuccessMessage: boolean;
  isTeamComplete: boolean;
}>();

defineEmits<{
  slotClick: [slot: Slot];
  removePlayer: [slot: Slot];
  saveTeam: [];
  editTeam: [];
  deleteTeam: [];
}>();

const slotStyle = (slot: Slot) => {
  if (slot.x !== null && slot.y !== null) {
    return {
      left: `${slot.x}%`,
      top: `${slot.y}%`,
      transform: "translate(-50%, -50%)",
      zIndex: 20,
    };
  }
  return {};
};
</script>
