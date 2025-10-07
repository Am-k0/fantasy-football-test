<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-900 text-white"
  >
    <div class="bg-gray-800 p-8 rounded-lg shadow-lg w-[420px]">
      <h1 class="text-3xl font-bold text-center mb-6">Sign Up</h1>

      <div v-if="error" class="bg-red-100 text-red-600 p-2 mb-3 rounded">
        {{ error }}
      </div>

      <div v-if="success" class="bg-green-100 text-green-600 p-2 mb-3 rounded">
        {{ success }}
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
          placeholder="Password (minimum 6 characters)"
          class="w-full"
          :disabled="isLoading"
        />
        <UButton type="submit" block :loading="isLoading" :disabled="isLoading">
          {{ isLoading ? "Signing up..." : "Sign Up" }}
        </UButton>
      </form>

      <p class="text-sm text-gray-400 text-center mt-4">
        Already have an account?
        <NuxtLink to="/login" class="text-blue-400 hover:underline"
          >Login</NuxtLink
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

const { signUp, init } = useSupabaseAuth();
await init();

const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");
const success = ref("");
const isLoading = ref(false);

const submit = async () => {
  error.value = "";
  success.value = "";
  isLoading.value = true;

  try {
    await signUp(email.value, password.value);
    success.value =
      "Account created! Please check your email to confirm, then login.";
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    } else {
      error.value = "Sign up failed";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
