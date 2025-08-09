<template>
  <aside
    id="logo-sidebar"
    class="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
    aria-label="Sidebar">
    <div class="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
      <ul class="space-y-2 font-medium">
        <li>
          <NuxtLink
            href="/"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <LayoutDashboard size="20" />
            <span class="ms-3">Dashboard</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            href="/pos"
            target="_blank"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <AppWindow size="20" />
            <span class="flex-1 ms-3 whitespace-nowrap"> POS </span>
          </NuxtLink>
        </li>
        <li
          v-if="
            authUser &&
            (authUser.role === 'super_admin' || authUser.role === 'admin')
          ">
          <NuxtLink
            href="/shifts"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <Clock size="20" />

            <span class="flex-1 ms-3 whitespace-nowrap"> Shifts </span>
          </NuxtLink>
        </li>
        <li v-if="authUser && authUser.role === 'super_admin'">
          <NuxtLink
            href="/shops"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <Store size="20" />

            <span class="flex-1 ms-3 whitespace-nowrap"> Shops </span>
          </NuxtLink>
        </li>
        <li
          v-if="
            authUser &&
            (authUser.role === 'super_admin' || authUser.role === 'admin')
          ">
          <NuxtLink
            href="/sales"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <BadgeDollarSign size="20" />

            <span class="flex-1 ms-3 whitespace-nowrap"> Sales </span>
          </NuxtLink>
        </li>
        <li
          v-if="
            authUser &&
            (authUser.role === 'super_admin' || authUser.role === 'admin')
          ">
          <NuxtLink
            href="/employees"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <ShieldUser size="20" />
            <span class="flex-1 ms-3 whitespace-nowrap"> Employees </span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            href="/customers"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <UsersRound size="20" />
            <span class="flex-1 ms-3 whitespace-nowrap"> Customers </span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            href="/categories"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <Warehouse size="20" />

            <span class="flex-1 ms-3 whitespace-nowrap">Inventory </span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            href="/purchase"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <ShoppingCart size="20" />

            <span class="flex-1 ms-3 whitespace-nowrap"> Purchase </span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            href="/variations"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <Tags size="20" />

            <span class="flex-1 ms-3 whitespace-nowrap">Variations </span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            href="/repairs"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <Wrench size="20" />

            <span class="flex-1 ms-3 whitespace-nowrap">Repairs </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import {
  Clock,
  Store,
  BadgeDollarSign,
  ShieldUser,
  UsersRound,
  ShoppingCart,
  Tags,
  Wrench,
  LayoutDashboard,
  Warehouse,
  AppWindow,
} from "lucide-vue-next";

const employeeStore = useEmployeeStore();
// Use storeToRefs to maintain reactivity
const { authUser } = storeToRefs(employeeStore);

onMounted(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    // no token → go to login
    router.replace("/login");
  } else {
    employeeStore.fetchAuthUser();
  }
});
</script>
