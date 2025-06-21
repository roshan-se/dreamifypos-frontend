<template>
  <client-only placeholder="">
    <div v-if="isReady" class="font-inter">
      <MondayModal />
      <Navbar/>
      <Sidebar/>
      <div class="p-4 sm:ml-64">
        <slot/>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MondayModal from '~/components/global/MondayModal.vue'

const isReady = ref(false)
const router  = useRouter()

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    // no token → go to login
    router.replace('/login')
  } else {
    // only now render the layout
    isReady.value = true
  }
})
</script>
