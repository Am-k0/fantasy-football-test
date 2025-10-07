<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import { useSupabaseAuth } from "~/composables/useSupabaseAuth";

const { user, signOut, init } = useSupabaseAuth();
await init();

const route = useRoute();
const router = useRouter();

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

const userMenuItems = computed(() => {
  if (!user.value) {
    return [];
  }

  return [
    [
      {
        label: user.value.email,
        icon: "i-heroicons-user",
        disabled: true,
      },
    ],
    [
      {
        label: "Logout",
        icon: "i-heroicons-arrow-right-on-rectangle",
        onSelect: handleLogout,
      },
    ],
  ];
});

const handleLogout = async () => {
  try {
    await signOut();
    router.push("/");
  } catch (e) {
    console.error("Logout error:", e);
  }
};

const handleAvatarClick = () => {
  if (!user.value) {
    router.push("/login");
  }
};
</script>

<template>
  <div>
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

        <UDropdownMenu v-if="user" :items="userMenuItems">
          <UTooltip text="Account">
            <UAvatar
              :alt="user.email"
              icon="i-heroicons-user"
              size="sm"
              class="cursor-pointer"
            />
          </UTooltip>
        </UDropdownMenu>

        <UTooltip v-else text="Login">
          <UAvatar
            icon="i-heroicons-user"
            size="sm"
            class="cursor-pointer"
            @click="handleAvatarClick"
          />
        </UTooltip>
      </template>
    </UHeader>

    <slot />
  </div>
</template>
