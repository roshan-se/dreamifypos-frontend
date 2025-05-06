<script setup>
import Navbar from '~/components/global/Navbar.vue';

</script>

<template>
    <div class="relative font-inter">
      <Navbar />
      <div class="">
        <slot />
      </div>
    </div>
  </template>
  