<script setup>
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useBranchStore } from "../../stores/branches";

const runtimeConfig = useRuntimeConfig();
const baseURL = runtimeConfig.public.apiBase;
const router = useRouter();
const branchStore = useBranchStore();

const activeDrop = ref(false);
const openModal = ref(false);

// Fetch branches on component mount
onMounted(async () => {
  await branchStore.fetchBranches();
});

const toggleDropdown = () => {
  activeDrop.value = !activeDrop.value;
};

const toggleModal = () => {
  openModal.value = !openModal.value;
};

const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    await $fetch(baseURL + "/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    localStorage.removeItem("token");
    router.push("/login");
  } catch (err) {
    console.error("Logout error:", err);
  }
};

// Set active branch
const setActiveBranch = (branch) => {
  branchStore.setActiveBranch(branch);
};
</script>

<template>
  <nav
    class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
    <div class="px-3 py-3 lg:px-5 lg:pl-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-start rtl:justify-end gap-4">
          <button
            data-drawer-target="logo-sidebar"
            data-drawer-toggle="logo-sidebar"
            aria-controls="logo-sidebar"
            type="button"
            class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
            <span class="sr-only">Open sidebar</span>
            <svg
              class="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg">
              <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" />
            </svg>
          </button>

          <a
            href="/"
            class="flex items-center">
            <img
              src="/main-logo.svg"
              alt="Logo"
              width="40"
              height="40"
              class="me-3" />
          </a>

          <!-- Branch Selector -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="outline"
                class="gap-2">
                <span v-if="branchStore.activeBranch">
                  {{ branchStore.activeBranch.name }}
                </span>
                <span v-else> Select Branch </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56 max-h-[300px] overflow-y-auto">
              <DropdownMenuLabel
                class="text-xs w-full text-center flex py-2 font-semibold"
                >------ Select Branch ------</DropdownMenuLabel
              >
              <DropdownMenuGroup>
                <DropdownMenuItem
                  v-for="branch in branchStore.branches"
                  :key="branch.id"
                  @click="setActiveBranch(branch)"
                  :class="{
                    'bg-gray-100 dark:bg-gray-700':
                      branchStore.activeBranch?.id === branch.id,
                  }">
                  {{ branch.name }}
                  <span
                    v-if="branchStore.activeBranch?.id === branch.id"
                    class="ml-auto">
                    ✓
                  </span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- Rest of your existing navbar code -->
        <div class="flex items-center relative">
          <div class="flex items-center ms-3">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="outline"
                  class="cursor-pointer">
                  <span class="relative">
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
                        d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                    </svg>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem class="cursor-pointer">
                    <NuxtLink
                      to="/"
                      target="_blank"
                      class="w-full"
                      >Dashboard</NuxtLink
                    >
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="cursor-pointer"
                    @click="toggleModal">
                    <span>Clock In/Out</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem class="cursor-pointer">
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="cursor-pointer"
                    @click="logout">
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>

    <ClockInOut
      :openModal="openModal"
      @close="openModal = false" />
  </nav>
</template>
