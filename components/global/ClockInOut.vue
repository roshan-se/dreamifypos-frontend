<script setup>
import { ref } from "vue";

const runtimeConfig = useRuntimeConfig();
const baseURL = runtimeConfig.public.apiBase;

defineProps({
  openModal: Boolean,
});
const emit = defineEmits(["close"]);

const selectedUser = ref(null);
const userPin = ref("");
const pinValidated = ref(false);
const employeeData = useEmployeeStore();
const errors = ref(null);
const selectedUserName = ref("");
const clockedIn = ref(false);
const clockInTime = ref('');

onMounted(() => {
  employeeData.fetchEmployees();
});

watch(selectedUser, (newUserId) => {
  if (newUserId) {
    const employee = employeeData.employees.find((emp) => emp.id === newUserId);
    selectedUserName.value = employee ? employee.name : "";
  }
});

const validatePin = async () => {
  try {
    const response = await $fetch( baseUrl + "/validate-pin", {
      method: "POST",
      body: {
        employee_id: selectedUser.value,
        pin_code: userPin.value,
      },
    });

    console.log("check ", response)

    // If successful, show clock-in/out options
    pinValidated.value = true;
    clockedIn.value = response.clocked_in;
    clockInTime.value = response.clock_in_time || '';
    errors.value = null; // Reset errors if successful
  } catch (error) {
    console.log("Checking error", error);
    errors.value = error.response?.data?.error || "An error occurred";
    pinValidated.value = false;
    clockedIn.value = false;
    clockInTime.value = '';
  }
};

const handleClockIn = async() => {
  try {
    const response = await $fetch( baseUrl + "/clock-in", {
      method: "POST",
      body: {
        employee_id: selectedUser.value,
        pin_code: userPin.value,
      },
    });

    console.log("check ", response)

    // If successful, show clock-in/out options
    clockInTime.value = response.clock_in_time || '';
    errors.value = null; // Reset errors if successful
  } catch (error) {
    console.log("Checking error", error);
    errors.value = error.response?.data?.error || "An error occurred";
    pinValidated.value = false;
    clockedIn.value = false;
    clockInTime.value = '';
  }
};

const handleClockOut = async() => {
  try {
    const response = await $fetch(baseUrl + "/clock-out", {
      method: "POST",
      body: {
        employee_id: selectedUser.value,
        pin_code: userPin.value,
      },
    });

    console.log("check ", response)

    // If successful, show clock-in/out options
    clockInTime.value = response.clock_in_time || '';
    errors.value = null; // Reset errors if successful
  } catch (error) {
    console.log("Checking error", error);
    errors.value = error.response?.data?.error || "An error occurred";
    pinValidated.value = false;
    clockedIn.value = false;
    clockInTime.value = '';
  }
};
</script>

<template>
  <div
      v-if="openModal"
      class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center content-center w-full md:inset-0 h-full max-h-full bg-black/70">
      <div class="relative p-4 w-full max-w-3xl m-auto">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          <!-- Modal header -->
          <div
            class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              Employee Clock In / Out
            </h3>
            <button
              @click="emit('close')"
              type="button"
              class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-hide="authentication-modal">
              <svg
                class="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14">
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <!-- Modal body -->
          <div class="p-4 md:p-5">
            <div
              v-if="errors"
              class="italic text-sm text-red-600 mb-2">
              {{ errors }}
            </div>
            <form class="space-y-4">
              <div class="grid grid-cols-2 gap-10">
                <div class="col-span-1 flex flex-col gap-6">
                  <div>
                    <label
                      for=""
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Employee</label
                    >
                    <select
                      v-model="selectedUser"
                      class="input-field"
                      required>
                      <option value="">Select employee</option>
                      <option
                        v-for="employee in employeeData.employees"
                        :key="employee.id"
                        :value="employee.id">
                        {{ employee.name }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      for=""
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Pin Code</label
                    >
                    <input
                      type="password"
                      v-model="userPin"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      placeholder="" />
                  </div>

                  <button
                    @click.prevent="validatePin"
                    class="font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-full"
                    :class="[
                      pinValidated
                        ? 'bg-gray-200 text-gray-500'
                        : ' text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 cursor-pointer ',
                    ]"
                    :disabled="pinValidated">
                    Select
                  </button>
                </div>

                <!-- Clock In/Out buttons show up only if PIN is valid -->
                <div
                  v-if="pinValidated"
                  class="col-span-1 flex flex-col gap-6">
                  <div v-if="clockedIn">
                    <div class="font-semibold">Employee: {{ selectedUserName }}</div>
                    <div class="font-semibold text-green-700 italic">Clocked In: {{ clockInTime }}</div>
                  </div>
                  <div v-if="!clockedIn">
                    <div>Employee: {{ selectedUserName }}</div>
                    <div>Clock In At:</div>
                  </div>
                  <div class="flex items-center gap-4 border-t pt-8 border-gray-300">
                    <button
                      @click.prevent="handleClockIn"
                      class="py-4 px-4 text-sm rounded-lg border border-solid cursor-pointer font-semibold text-center shadow-xs transition-all duration-500  w-full" :class="[clockedIn ? 'bg-gray-200 text-gray-400 border-gray-200' : 'border-green-200  cursor-pointer  bg-green-500 hover:bg-green-600 text-white']" :disabled="clockedIn">
                      Clock In
                    </button>

                    <button
                      @click="handleClockOut"
                      class="py-4 px-4 text-sm rounded-lg border border-gray-200 border-solid  font-semibold text-center shadow-xs transition-all duration-500 bg-gray-200 text-gray-400  w-full" :class="[clockedIn ? 'border-red-200 cursor-pointer bg-red-200 hover:bg-red-600 text-red-600 hover:text-white' : '']" :disabled="!clockedIn">
                      Clock Out
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
</template>
