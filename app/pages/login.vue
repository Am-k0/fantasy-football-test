<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-900 text-white"
  >
    <div class="bg-gray-800 p-8 rounded-lg shadow-lg w-[420px]">
      <h1 class="text-3xl font-bold text-center mb-6">Login</h1>

      <div v-if="error" class="bg-red-100 text-red-600 p-2 mb-3 rounded">
        {{ error }}
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <UInput
          v-model="email"
          type="email"
          placeholder="Email"
          class="w-full"
          :disabled="isLoading"
        />
        <UInput
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full"
          :disabled="isLoading"
        />
        <UButton type="submit" block :loading="isLoading" :disabled="isLoading">
          {{ isLoading ? "Logging in..." : "Login" }}
        </UButton>
      </form>

      <p class="text-sm text-gray-400 text-center mt-4">
        No account?
        <NuxtLink to="/signup" class="text-blue-400 hover:underline"
          >Sign up</NuxtLink
        >
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSupabaseAuth } from "~/composables/useSupabaseAuth";
import { useRouter } from "vue-router";

definePageMeta({
  middleware: "auth",
});

const { signIn, init } = useSupabaseAuth();
await init();

const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");
const isLoading = ref(false);

const submit = async () => {
  error.value = "";
  isLoading.value = true;

  try {
    await signIn(email.value, password.value);
    router.push("/team-builder");
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    } else {
      error.value = "Login failed";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
