<script setup>
import { ref, onMounted } from "vue";
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

import JsBarcode from "jsbarcode";

defineProps({
  products: Array,
});
const productStore = useProductStore();

// onMounted(() => {
//   productStore.fetchProducts();
// });

const printBarcode = async (product) => {
  const count = prompt(`How many barcodes to print for "${product.name}"?`, "1");

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
            Stock
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
          <td
            class="px-6 py-4"
            :class="[
              product.stock_quantity > 10 ? 'text-green-600' : 'text-red-600',
            ]">
            {{ product.stock_quantity }}
          </td>
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
</template>
