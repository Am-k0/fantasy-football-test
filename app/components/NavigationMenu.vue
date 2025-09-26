<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Dashboard",
    to: "/",
    active: route.path === "/",
  },
  {
    label: "Matches",
    to: "/matches",
    active: route.path.startsWith("/matches"),
  },
  {
    label: "Players",
    to: "/players",
    active: route.path.startsWith("/players"),
  },
  {
    label: "Team Builder",
    to: "/team-builder",
    active: route.path.startsWith("/team-builder"),
  },
]);
</script>

<template>
  <UHeader>
    <template #title>
      <div class="flex items-center space-x-2">
        <UIcon name="i-mdi-football" />
        <span class="font-bold text-xl">Football Fantasy</span>
      </div>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />

      <UTooltip text="Open on GitHub">
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/Am-k0/fantasy-football-test/"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>
    </template>
  </UHeader>
</template>
