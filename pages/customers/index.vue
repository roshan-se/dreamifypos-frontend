<script setup>
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
import CustomersTable from "~/components/shared/CustomersTable.vue";

definePageMeta({
  layout: "default",
});

const customerStore = useCustomerStore();

const customerFormData = reactive({
  name: "",
  phone: "",
  email: "",
});

const resetForm = () => {
  customerFormData.name = "";
  customerFormData.email = "";
  customerFormData.phone = "";
};

const handleCreateCustomer = async () => {
  const res = await customerStore.addCustomer(customerFormData);

  if (res.errors) {
    console.log("Check", res.message);
    console.log("Checking response in form", Object.values(res.errors)[0][0]);
    errors.value = Object.values(res.errors)[0][0];
  } else {
    openModal.value = false;
    customerFormData.name = "";
    customerFormData.email = "";
    customerFormData.phone = "";
    useToastify("Customer added successfully!", {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "success",
    });
    customerStore.fetchCustomers();
  }
};
</script>

<template>
  <div
    class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
    <AlertDialog>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-xl font-semibold uppercase">Customers</h1>

        <AlertDialogTrigger>
          <div class="primary-btn">Add Customer</div>
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
            required />
        </div>
      </form>

      <CustomersTable />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>New Variation</AlertDialogTitle>
          <AlertDialogDescription>
            <div class="p-4 md:p-5">
              <div
                v-if="errors"
                class="italic text-sm text-red-600 mb-2">
                {{ errors }}
              </div>
              <form
                class="space-y-4"
                autocomplete="off">
                <div class="grid grid-cols-2 gap-4">
                  <div class="col-span-2">
                    <label
                      for=""
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Customer Name</label
                    >
                    <input
                      type="text"
                      v-model="customerFormData.name"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      autocomplete="off" />
                  </div>
                  <div>
                    <label
                      for=""
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Phone Number</label
                    >
                    <input
                      type="text"
                      v-model="customerFormData.phone"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      autocomplete="off" />
                  </div>
                  <div>
                    <label
                      for=""
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Email</label
                    >
                    <input
                      type="text"
                      v-model="customerFormData.email"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      autocomplete="off" />
                  </div>
                </div>
              </form>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="resetForm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            @click="handleCreateCustomer"
            class="primary-btn"
            >Create</AlertDialogAction
          >
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
