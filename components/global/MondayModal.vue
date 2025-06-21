<template>
  <div v-if="showModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 bg-opacity-50">
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h2 class="text-2xl font-bold mb-4">Hey, it's Monday!</h2>
      <p class="mb-4">
        Send Your Order to MPPC! 🎉
      </p>
      <button
        @click="closeModal"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showModal = ref(false);

onMounted(() => {
  const today = new Date().getDay();
  if (today === 2) { // 0 = Sunday, 1 = Monday, 2 = Tuesday
    showModal.value = true;
  }
});

const closeModal = () => {
  showModal.value = false;
};
</script>
