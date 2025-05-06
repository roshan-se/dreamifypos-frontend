<script setup lang="ts">
import RepairsTable from '~/components/tables/RepairsTable.vue';

</script>

<template>
    <div
      class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
      <div class="flex justify-between items-center mb-6">
          <h1 class="text-xl font-semibold uppercase">Repairs</h1>

          <NuxtLink to="/repairs/create" class="primary-btn">
            Add Repair
          </NuxtLink>
        </div>

        <RepairsTable />
    </div>
</template>