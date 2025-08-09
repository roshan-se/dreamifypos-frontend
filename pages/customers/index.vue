<script setup>
import { ref, reactive } from "vue";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import CustomersTable from "~/components/tables/CustomersTable.vue";
import Button from "~/components/ui/button/Button.vue";

definePageMeta({
  layout: "default",
});

const customerStore = useCustomerStore();

// controls modal visibility
const openModal = ref(false);
// are we editing, or creating?
const isEditMode = ref(false);
// which customer to update?
const currentCustomerId = ref(null);

const customerFormData = reactive({
  name: "",
  phone: "",
  email: "",
});

const resetForm = () => {
  customerFormData.name = "";
  customerFormData.phone = "";
  customerFormData.email = "";
  currentCustomerId.value = null;
  isEditMode.value = false;
  openModal.value = false;
};

const openCreateDialog = () => {
  resetForm();
  openModal.value = true;
};

const handleEditCustomer = (customer) => {
  console.log("checking customers", customer);
  isEditMode.value = true;
  currentCustomerId.value = customer.id;
  customerFormData.name = customer.name;
  customerFormData.phone = customer.phone;
  customerFormData.email = customer.email;
  openModal.value = true;
};

const handleSubmit = async () => {
  if (isEditMode.value) {
    // update
    const res = await customerStore.updateCustomer(
      currentCustomerId.value,
      customerFormData
    );
    if (!res.errors) {
      useToastify("Customer updated!", {
        type: "success",
        position: "top-right",
      });
    }
  } else {
    // create
    const res = await customerStore.addCustomer(customerFormData);
    if (!res.errors) {
      useToastify("Customer added!", {
        type: "success",
        position: "top-right",
      });
    }
  }
  openModal.value = false;
  customerStore.fetchCustomers();
};
</script>

<template>
  <div
    class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
    <AlertDialog
      :open="openModal"
      @open-change="openModal = $event">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-xl font-semibold uppercase">Customers</h1>

        <AlertDialogTrigger>
          <Button
            @click="openCreateDialog"
            class="bg-sky-600 hover:bg-sky-800 cursor-pointer"
            variant="default"
            >Add Customer</Button
          >
        </AlertDialogTrigger>
      </div>
      <form class="flex items-center w-full mb-8">
        <label
          htmlFor="simple-search"
          class="sr-only">
          Search
        </label>
        <div class="relative w-full">
          <div
            class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 20">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2" />
            </svg>
          </div>
          <input
            type="text"
            id="simple-search"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search customer..."
            autocomplete="off"
            required />
        </div>
      </form>

      <CustomersTable @edit-customer="handleEditCustomer" />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {{ isEditMode ? "Edit Customer" : "New Customer" }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <form
              class="space-y-4 p-4 md:p-5"
              autocomplete="off"
              @submit.prevent="handleSubmit">
              <div
                v-if="customerStore.errors"
                class="text-red-600 italic text-sm">
                {{ customerStore.errors }}
              </div>
              <div class="grid grid-cols-2 gap-4">
                <!-- name -->
                <div class="col-span-2">
                  <label class="block mb-2 text-sm font-medium">Name</label>
                  <input
                    v-model="customerFormData.name"
                    required
                    class="input-field" />
                </div>
                <!-- phone -->
                <div>
                  <label class="block mb-2 text-sm font-medium">Phone</label>
                  <input
                    v-model="customerFormData.phone"
                    required
                    class="input-field" />
                </div>
                <!-- email -->
                <div>
                  <label class="block mb-2 text-sm font-medium">Email</label>
                  <input
                    v-model="customerFormData.email"
                    required
                    class="input-field" />
                </div>
              </div>
            </form>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel class="bg-red-400 hover:bg-red-600 text-white hover:text-white cursor-pointer" @click="resetForm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            @click="handleSubmit"
            class="bg-sky-600 hover:bg-sky-800 cursor-pointer">
            {{ isEditMode ? "Update" : "Create" }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
