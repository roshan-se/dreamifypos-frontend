<script setup>
import MetricsCards from "~/components/dashboard/MetricsCards.vue";
import RecentTransaction from "~/components/dashboard/RecentTransaction.vue";
import TopSellingProduct from "~/components/dashboard/TopSellingProduct.vue";
import RepairsTable from "~/components/tables/RepairsTable.vue";

const runtimeConfig = useRuntimeConfig();
const baseURL = runtimeConfig.public.apiBase;

const openModal = ref(false);
const errors = ref("");

const dashboardData = ref(null);

onMounted(() => {
  fetchDashboardData();
});

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
      :totalOrders="dashboardData ? dashboardData.total_orders : 0"
      :pendingRepairsCount="
        dashboardData ? dashboardData.pending_repairs_count : 0
      "
      :completedRepairsCount="
        dashboardData ? dashboardData.completed_repairs_count : 0
      " />

  </div>
</template>
