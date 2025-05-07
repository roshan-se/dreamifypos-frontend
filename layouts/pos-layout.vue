<script setup>
import Navbar from "~/components/global/Navbar.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const isReady = ref(false);
const router = useRouter();

onMounted(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    // no token → go to login
    router.replace("/login");
  } else {
    // only now render the layout
    isReady.value = true;
  }
});
</script>

<template>
  <client-only placeholder="">
    <div
      v-if="isReady"
      class="relative font-inter">
      <Navbar />
      <div class="">
        <slot />
      </div>
    </div>
  </client-only>
</template>
