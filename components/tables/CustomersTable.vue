<script setup>
import { onMounted } from "vue";
import {
  SquarePen, Trash
} from "lucide-vue-next";
import {
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const customerData = useCustomerStore();

onMounted(() => {
  customerData.fetchCustomers();
});

const confirmDelete = async (value) => {
  if (confirm("Are you sure you want to delete this customer?")) {
    const res = await customerData.deleteCustomer(value);

    if (res.errors) {
      let errorMsg = Object.values(res.errors)[0][0];
      useToastify(errorMsg, {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "error",
      });
    } else {
      useToastify("Customer deleted successfully!", {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "success",
      });
      await customerData.fetchCustomers();
    }
  }
};
</script>

<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table
      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th
            scope="col"
            class="px-6 py-3">
            Customer ID
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            Customer Name
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            Email
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            Phone
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            Action
          </th>
        </tr>
      </thead>
      <tbody v-if="customerData.customers">
        <tr
          v-for="customer in customerData.customers"
          :key="customer.id"
          class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
          <td
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            {{ customer.id }}
          </td>
          <td
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            {{ customer.name }}
          </td>
          <td
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            {{ customer.email }}
          </td>
          <td
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            {{ customer.phone }}
          </td>
          <td class="px-6 py-4 flex items-center gap-2">
            <AlertDialogTrigger asChild>
              <button @click="$emit('edit-customer', customer)" class="text-sky-600 hover:text-sky-800">
                <SquarePen size="20" />
              </button>
            </AlertDialogTrigger>
            <button
              @click="confirmDelete(customer.id)"
              class="text-red-500 hover:text-red-600">
              <Trash size="20" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
