<template>
  <UContainer class="py-10">
    <div class="space-y-6">
      <div class="text-center">
        <div class="flex items-center justify-center gap-3 mb-2">
          <UIcon name="i-heroicons-users" class="w-10 h-10 text-primary-500" />
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Players
          </h1>
        </div>
      </div>

      <PlayersTable />
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import PlayersTable from "@/components/players/PlayersTable.vue";

useSeoMeta({
  title: "Players Database",
});
</script>
