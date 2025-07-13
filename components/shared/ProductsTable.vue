<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import JsBarcode from "jsbarcode";

defineProps({
  products: Array,
});

const runtimeConfig = useRuntimeConfig();
const baseURL = runtimeConfig.public.apiBase;

const productStore = useProductStore();
const stockModalOpen = ref(false);
const selectedProduct = ref(null);
const stockData = ref([]);

// Enable editing for a row
const enableEditing = (item) => {
  stockData.value.forEach((i) => {
    i.editing = false;
    i.editedQuantity = i.quantity;
  });
  item.editing = true;
};

// Cancel editing
const cancelEditing = (item) => {
  item.editing = false;
};

// Update quantity
const updateQuantity = async (item) => {
  try {
    const response = await axios.put(
      `${baseURL}/inventory/${selectedProduct.value.id}/branch/${item.branch_id}`,
      {
        quantity: item.editedQuantity,
      }
    );

    item.quantity = item.editedQuantity;
    item.editing = false;

    // Show success notification
    toast.success("Quantity updated successfully");
  } catch (error) {
    console.error("Error updating quantity:", error);
    toast.error("Failed to update quantity");
  }
};

// Fetch stock data (your existing function)
const fetchStockData = async (product) => {
  selectedProduct.value = product;
  try {
    const response = await axios.get(`${baseURL}/products/${product.id}/inventory`);
    stockData.value = response.data.data.map((item) => ({
      ...item,
      editing: false,
      editedQuantity: item.quantity,
    }));
    stockModalOpen.value = true;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    toast.error("Failed to load inventory data");
  }
};

const printBarcode = async (product) => {
  const count = prompt(
    `How many barcodes to print for "${product.name}"?`,
    "1"
  );

  const quantity = parseInt(count);
  if (isNaN(quantity) || quantity <= 0) {
    alert("Please enter a valid quantity.");
    return;
  }

  // Create HTML with multiple barcodes
  let barcodeHTML = "";

  for (let i = 0; i < quantity; i++) {
    const div = document.createElement("div");
    div.style.marginBottom = "12px";

    const svg = document.createElement("svg");
    JsBarcode(svg, product.sku, {
      format: "CODE128",
      lineColor: "#000",
      width: 2,
      height: 50,
      displayValue: true,
      fontSize: 14,
    });

    const label = `<p style="text-align:center; font-size:12px;">${product.name}</p>`;
    div.appendChild(svg);
    div.innerHTML += label;

    barcodeHTML += div.outerHTML;
  }

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Barcodes</title>
        <style>
          body {
            font-family: sans-serif;
            padding: 20px;
            width: 80mm;
            text-align: center;
          }
          svg {
            display: block;
            margin: 0 auto;
          }
          p {
            margin: 4px 0;
          }
        </style>
      </head>
      <body>${barcodeHTML}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

const emit = defineEmits();

const confirmDelete = async (value) => {
  if (confirm("Are you sure you want to delete this product?")) {
    const res = await productStore.deleteProduct(value);

    if (res.errors) {
      let errorMsg = Object.values(res.errors)[0][0];
      useToastify(errorMsg, {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "error",
      });
    } else {
      useToastify("Product deleted successfully!", {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "success",
      });
      emit("create-product");
    }
  }
};

onMounted(() => {
  productStore.fetchProducts();
});
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
            Id
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            Product Name
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-center">
            Cost Price
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-center">
            Selling Price
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            SKU
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="product in products"
          :key="product.id"
          class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
          <td class="px-6 py-4">{{ product.id }}</td>
          <td
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            {{ product.name }}
          </td>

          <td class="px-6 py-4 text-blue-600 text-center">
            ${{ product.purchase_price }}
          </td>
          <td class="px-6 py-4 text-green-600 text-center">
            ${{ product.selling_price }}
          </td>
          <td class="px-6 py-4">{{ product.sku }}</td>

          <td class="px-6 py-4 flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="outline"
                  class="cursor-pointer"
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    class="cursor-pointer"
                    @click="printBarcode(product)">
                    <span>Print Barcode</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="cursor-pointer"
                    @click="fetchStockData(product)">
                    <span>Check Stock</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="cursor-pointer"
                    @click="$emit('edit-product', product)">
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="cursor-pointer"
                    @click="confirmDelete(product.id)">
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <Dialog
    :open="stockModalOpen"
    @update:open="(val) => (stockModalOpen = val)">
    <DialogContent class="w-full !max-w-max">
      <DialogHeader>
        <DialogTitle>
          Stock Inventory for
          <span class="text-green-700">{{ selectedProduct?.name }}</span>
        </DialogTitle>
        <DialogDescription>
          Current stock levels across all branches
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <table
          class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead
            class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th
                scope="col"
                class="px-6 py-3">
                Branch ID
              </th>
              <th
                scope="col"
                class="px-6 py-3">
                Branch Name
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-center">
                Quantity
              </th>
              <th
                scope="col"
                class="px-6 py-3">
                Status
              </th>
              <th
                scope="col"
                class="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in stockData"
              :key="item.branch_id"
              class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
              <td class="px-6 py-4">{{ item.branch_id }}</td>
              <td
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {{ item.branch_name }}
              </td>
              <td
                class="px-6 py-4 font-medium text-center text-gray-900 whitespace-nowrap dark:text-white flex items-center justify-center">
                <template v-if="item.editing">
                  <Input
                    v-model="item.editedQuantity"
                    type="number"
                    min="0"
                    class="w-20 text-center" />
                </template>
                <template v-else>
                  {{ item.quantity }}
                  <Button
                    variant="ghost"
                    size="sm"
                    class="ml-2"
                    @click="enableEditing(item)">
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
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </Button>
                </template>
              </td>
              <td
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                <Badge :variant="item.quantity > 5 ? 'default' : 'destructive'">
                  {{ item.quantity > 5 ? "In Stock" : "Low Stock" }}
                </Badge>
              </td>
              <td class="px-6 py-4">
                <template v-if="item.editing">
                  <Button
                    variant="outline"
                    size="sm"
                    class="mr-2"
                    @click="cancelEditing(item)">
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    @click="updateQuantity(item)">
                    Save
                  </Button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DialogContent>
  </Dialog>
</template>
