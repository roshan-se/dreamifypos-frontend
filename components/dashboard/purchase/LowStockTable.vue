<script setup>
import { onMounted } from "vue";

const productStore = useProductStore();

onMounted(() => {
  productStore.fetchLowStockProducts();
});
</script>

<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-6">
    <h2 class="text-lg font-bold mb-2">Low Stock Products (≤ 5 units)</h2>
    <table
      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead
        class="text-xs text-gray-700 uppercase bg-yellow-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th class="px-6 py-3">Product</th>
          <th class="px-6 py-3">Quantity</th>
          <th class="px-6 py-3">Category</th>
          <th class="px-6 py-3">Action</th>
        </tr>
      </thead>
      <tbody v-if="productStore.lowStock">
        <tr
          v-for="product in productStore.lowStock"
          :key="product.id"
          class="odd:bg-white even:bg-yellow-50 border-b dark:border-gray-700 dark:text-white">
          <td class="px-6 py-4 font-medium">{{ product.name }}</td>
          <td class="px-6 py-4">{{ product.stock_quantity }}</td>
          <td class="px-6 py-4">{{ product.category?.name || "N/A" }}</td>
          <td class="px-6 py-4">
            <button class="primary-btn">Order Now</button>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td
            colspan="3"
            class="px-6 py-4 text-center text-gray-400">
            No low stock products found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
