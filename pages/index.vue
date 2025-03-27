<script setup>
import MetricsCards from "~/components/dashboard/MetricsCards.vue";
import RecentTransaction from "~/components/dashboard/RecentTransaction.vue";
import TopSellingProduct from "~/components/dashboard/TopSellingProduct.vue";

const openModal = ref(false);
const errors = ref("");

const dashboardData = ref(null);

onMounted(() => {
  fetchDashboardData();
});

const baseURL = "http://127.0.0.1:8000/api";

const fetchDashboardData = async () => {
  try {
    const response = await $fetch(`${baseURL}/dashboard`);
    console.log(response);
    dashboardData.value = response.data;
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};
</script>

<template>
  <div
    class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
    <div class="flex flex-col mb-6">
      <h1 class="text-xl font-semibold uppercase">Dashboard</h1>
      <h4 class="text-gray-400 text-sm">Welcome to Dreamify POS</h4>
    </div>
    <MetricsCards
      :totalSuppliers="dashboardData ? dashboardData.total_suppliers : 0"
      :totalCustomers="dashboardData ? dashboardData.total_customers : 0"
      :totalEmployees="dashboardData ? dashboardData.total_employees : 0"
      :totalOrders="dashboardData ? dashboardData.total_orders : 0" />

    <div class="mt-10">
      <RecentTransaction
        :recentSales="
          dashboardData && dashboardData.recent_transactions
            ? dashboardData.recent_transactions
            : null
        " />
    </div>

    <div class="grid grid-cols-12 mt-10">
      <div class="col-span-8">
        <h2 class="text-lg font-semibold normal">Low Stock Products</h2>
        <div
          v-if="dashboardData && dashboardData.low_stock_products"
          class="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
          <table
            class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead
              class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3">
                  Id
                </th>
                <th
                  scope="col"
                  class="px-6 py-3">
                  Product Name
                </th>
                <th
                  scope="col"
                  class="px-6 py-3">
                  SKU
                </th>
                <th
                  scope="col"
                  class="px-6 py-3">
                  Stock
                </th>
                <th
                  scope="col"
                  class="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in dashboardData.low_stock_products"
                :key="product.id"
                class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                <td class="px-6 py-4">{{ product.id }}</td>
                <td
                  class="px-6 py-4 font-medium capitalize text-gray-900 whitespace-nowrap dark:text-white">
                  {{ product.name }}
                </td>
                <td class="px-6 py-4">{{ product.sku }}</td>
                <td
                  class="px-6 py-4"
                  :class="[
                    product.stock_quantity > 10
                      ? 'text-green-600'
                      : 'text-red-600',
                  ]">
                  {{ product.stock_quantity }}
                </td>
                <td class="px-6 py-4 flex items-center gap-2">
                  <a
                    href="#"
                    class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-6">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </a>
                  <button
                    @click="confirmDelete(product.id)"
                    class="font-medium text-red-600 dark:text-red-500 hover:underline">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-6">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="col-span-4">
        <div v-if="dashboardData && dashboardData.top_selling_product">
          <TopSellingProduct
            :topSellingProduct="
              dashboardData && dashboardData.top_selling_product
                ? dashboardData.top_selling_product
                : null
            " />
        </div>
      </div>
    </div>
  </div>
</template>
