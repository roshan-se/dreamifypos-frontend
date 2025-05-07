<script setup>
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const router = useRouter();

const activeDrop = ref(false);
const openModal = ref(false);

const toggleDropdown = () => {
  activeDrop.value = !activeDrop.value;
};

const toggleModal = () => {
  console.log("I am clicked");
  openModal.value = !openModal.value;
};

const logout = async () => {
  const baseURL = "http://127.0.0.1:8000/api";
  
  try {
    const token = localStorage.getItem('token');

    const response = await $fetch(baseURL + "/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    localStorage.removeItem("token");
    router.push("/login");

  } catch (err) {
    console.error("Unexpected error:", err.response);
  }
};
</script>

<template>
  <nav
    class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
    <div class="px-3 py-3 lg:px-5 lg:pl-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-start rtl:justify-end">
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
                clipRule="evenodd"
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
            </svg>
          </button>
          <a
            href="https://flowbite.com"
            class="flex ms-2 md:me-24">
            <img
              src="/main-logo.svg"
              alt="Logo"
              width="40"
              height="40"
              class="me-3" />
          </a>
        </div>
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
                    <NuxtLink to="/" target="_blank" class="w-full">Dashboard</NuxtLink>
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
