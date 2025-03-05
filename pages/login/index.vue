<script setup>
definePageMeta({
  layout: "auth",
});

const email = ref("");
const password = ref("");
const error = ref("");

const handleSubmit = async () => {
  error.value = "";

  try {
    const { data, error: fetchError } = await useFetch(
      "http://127.0.0.1:8000/api/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { email: email.value, password: password.value },
      }
    );

    if (fetchError.value) {
      error.value = fetchError.value.data?.message || "Invalid credentials";
      return;
    }

    if (data.value?.access_token) {
      localStorage.setItem("token", data.value.access_token);
      router.push("/dashboard"); // Redirect after login
    }
  } catch (err) {
    console.error("Login Error:", err);
    error.value = "Something went wrong. Please try again.";
  }
};
</script>

<template>
  <div
    class="bg-white flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm text-center">
      <img
        src="/main-logo.svg"
        class="mx-auto w-24 h-24"
        alt="Logo" />
      <h2
        class="mt-5 text-center text-2xl font-bold tracking-tight text-gray-900">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <p
        v-if="error"
        class="text-red-500 text-sm mb-4">
        {{ error }}
      </p>

      <form
        @submit.prevent="handleSubmit"
        class="space-y-6">
        <div>
          <label
            htmlFor="email"
            class="block text-sm font-medium text-gray-900">
            Email address
          </label>
          <div class="mt-2">
            <input
              type="email"
              id="email"
              name="email"
              v-model="email"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Enter your email"
              required />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label
              htmlFor="password"
              class="block text-sm font-medium text-gray-900">
              Password
            </label>
          </div>
          <div class="mt-2">
            <input
              type="password"
              id="password"
              name="password"
              v-model="password"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Enter your password"
              required />
          </div>
        </div>
        <div class="flex justify-end">
          <a
            href="#"
            class="font-medium text-sm text-blue-500 hover:text-indigo-700">
            Forgot password?
          </a>
        </div>

        <div>
          <button
            type="submit"
            class="primary-btn w-full">
            Sign in
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
