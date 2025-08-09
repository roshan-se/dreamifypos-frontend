<script setup>
import { onMounted } from "vue";
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

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const productStore = useProductStore();
const purchaseStore = usePurchaseStore();

const selectedProduct = ref(null);
const quantity = ref(1);
const openDialog = ref(false);

const branchStore = useBranchStore()

onMounted(() => {
  productStore.fetchLowStockProducts();
});

const openPurchaseDialog = (item) => {
  selectedProduct.value = item;
  quantity.value = 1;
  openDialog.value = true;
};

const handleCreatePurchase = async () => {
  const res = await purchaseStore.addPurchase({
    id: selectedProduct.value.product.id,
    quantity: quantity.value,
    branch_id: branchStore.activeBranch.id
  });

  if (res.error) {
    useToastify(res.message, { type: 'error' });
  } else {
    useToastify("Purchase created successfully!", { type: 'success' });
    openDialog.value = false;
    await productStore.fetchLowStockProducts();
  }
};
</script>

<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-6 border">
    <h2 class="text-lg font-bold px-4 py-4">Low Stock Products (≤ 5 units)</h2>
    <table
      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead
        class="text-xs text-gray-700 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th class="px-6 py-3">Product</th>
          <th class="px-6 py-3">Quantity</th>
          <th class="px-6 py-3">Category</th>
          <th class="px-6 py-3">Action</th>
        </tr>
      </thead>
      <tbody v-if="productStore.lowStock">
        <tr
          v-for="item in productStore.lowStock"
          :key="item.product.id"
          class="odd:bg-white even:bg-blue-50 border-b dark:border-gray-700 dark:text-white">
          <td class="px-6 py-4 font-medium">{{ item.product.name }}</td>
          <td class="px-6 py-4">{{ item.quantity }}</td>
          <td class="px-6 py-4">{{ item.product.category?.name || "N/A" }}</td>
          <td class="px-6 py-4">
            <Button
              variant="outline"
              class="cursor-pointer"
              @click="openPurchaseDialog(item)">
              Order Now
            </Button>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td
            colspan="3"
            class="px-6 py-4 text-center text-gray-400">
            No low stock products found.
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Alert Dialog Modal -->
    <AlertDialog v-model:open="openDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>New Purchase</AlertDialogTitle>
          <AlertDialogDescription>
            Add new stock for : <strong class="text-blue-600">{{ selectedProduct?.product.name }}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div class="space-y-4 py-2">
          <div>
            <label class="text-sm font-medium">Old Stock</label>
            <Input
              type="number"
              min="1"
              v-model.number="selectedProduct.quantity"
              class="mt-1" disabled />
          </div>

          <div>
            <label class="text-sm font-medium">New Quantity</label>
            <Input
              type="number"
              min="1"
              v-model.number="quantity"
              class="mt-1" />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel class="text-white hover:text-white bg-red-400 hover:bg-red-600">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="handleCreatePurchase" class="bg-sky-600 hover:bg-sky-800">
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
