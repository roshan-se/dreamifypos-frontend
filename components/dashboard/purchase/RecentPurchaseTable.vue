<script setup>
import { ref, onMounted } from "vue";

const purchaseStore = usePurchaseStore();

onMounted(() => {
    purchaseStore.fetchPurchases();
});

const confirmDelete = async (value) => {
  if (confirm("Are you sure you want to delete this purchase record?")) {
    const res = await purchaseStore.deletePurchase(value);

    if (res.errors) {
      let errorMsg = Object.values(res.errors)[0][0];
      useToastify(errorMsg, {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "error",
      });
    } else {
      useToastify("Purchase deleted successfully!", {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "success",
      });
      await purchaseStore.fetchPurchases();
    }
  }
};
</script>

<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <h2 class="text-lg font-bold mb-2">Recent History</h2>
    <table
      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th
            scope="col"
            class="px-6 py-3">
            Product
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-center">
            Quantity
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            Total Price
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            Date
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            Action
          </th>
        </tr>
      </thead>
      <tbody v-if="purchaseStore.purchases">
        <tr
          v-for="purchase in purchaseStore.purchases"
          :key="purchase.id"
          class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
          <td
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            {{ purchase.product?.name || "N/A" }}
          </td>
          <td
            class="px-6 py-4 font-medium text-gray-900 text-center whitespace-nowrap dark:text-white">
            {{ purchase.quantity }}
          </td>
          <td
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            ${{ purchase.total_price }}
          </td>
          <td
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            {{ new Date(purchase.created_at).toLocaleDateString() }}
          </td>
          <td class="px-6 py-4 flex gap-2">
            <button
              @click="confirmDelete(purchase.id)"
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
</template>
