<script setup>
import Navbar from '~/components/global/Navbar.vue';

</script>

<template>
    <div class="relative">
      <Navbar />
      <div class="">
        <slot />
      </div>
    </div>
  </template>
  