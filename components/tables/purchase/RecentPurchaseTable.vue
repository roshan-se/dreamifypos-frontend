<script setup>
import { Trash2 } from "lucide-vue-next";
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
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg border">
    <h2 class="text-lg font-bold px-4 py-4">Recent History</h2>
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
            class="px-6 py-4 font-medium text-emerald-600 whitespace-nowrap dark:text-white">
            ${{ purchase.total_price }}
          </td>
          <td
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            {{ new Date(purchase.created_at).toLocaleDateString() }}
          </td>
          <td class="px-6 py-4 flex gap-2">
            <button
              @click="confirmDelete(purchase.id)"
              class="font-medium text-red-500 hover:text-red-600 hover:underline">
              <Trash2 size="20" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
