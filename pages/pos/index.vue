<script setup>
import { ref, computed, onMounted } from "vue";
import PosView from "~/components/shared/PosView.vue";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

definePageMeta({ layout: "pos-layout" });

const runtimeConfig = useRuntimeConfig();
const baseURL = runtimeConfig.public.apiBase;

// Stores
const categoryStore = useCategoryStore();
const productStore = useProductStore();
const customerStore = useCustomerStore();

// State
const selectedCategory = ref(null);
const cart = ref([]);
const searchQuery = ref("");
const selectedCustomer = ref(null);
const discount = ref(0);

// Payment & checkout state
const eftpos = ref(0);
const cash = ref(0);
const loading = ref(false);
const success = ref(false);

const dialogOpen = ref(false);

const gstRate = 0.1;

const discountInput = reactive({});

// called when the user clicks “Add Discount”
const addDiscount = (itemId) => {
  const perUnit = parseFloat(discountInput[itemId] || 0);
  const item = cart.value.find((i) => i.id === itemId);
  if (!item) return;

  // total discount = perUnit * quantity
  item.discount = perUnit * item.quantity;
  item.total_price = item.selling_price * item.quantity - item.discount;

  // clear the draft, or close the dialog…
  discountInput[itemId] = 0;
};

// Computed values
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return [];
  return customerStore.customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const subtotal = computed(() =>
  cart.value.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2)
);

const totalDisc = computed(() =>
  cart.value
    .reduce((sum, i) => sum + (i.discount || 0) * i.quantity, 0)
    .toFixed(2)
);
const totalTax = computed(() =>
  cart.value.reduce((sum, item) => sum + item.tax, 0).toFixed(2)
);

// And if you want a grand total (incl‐tax minus discounts):
const grandTotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.total_price, 0)
);

const changeAmount = computed(() => {
  const paid = parseFloat(eftpos.value || 0) + parseFloat(cash.value || 0);
  return paid > parseFloat(grandTotal.value)
    ? (paid - parseFloat(grandTotal.value)).toFixed(2)
    : "0.00";
});

watch(
  cart,
  (newCart) => {
    newCart.forEach((item) => {
      const gross = item.selling_price * item.quantity;
      // extract the GST portion from an inclusive‐tax price
      item.tax = parseFloat((gross * gstRate).toFixed(2));
      // you can still compute subtotal and total_price as before…
      item.subtotal = parseFloat(gross.toFixed(2));
      const discountTotal = (item.discount || 0) * item.quantity;
      item.total_price = parseFloat((gross - discountTotal).toFixed(2));
    });
  },
  { deep: true }
);

// Lifecycle
onMounted(() => {
  categoryStore.fetchCategories();
  productStore.fetchProducts();
  customerStore.fetchCustomers();
});

// Cart operations
const addToCart = (product) => {
  const existing = cart.value.find((i) => i.id === product.id);
  if (existing) {
    // increment and recalc
    existing.quantity++;
    existing.subtotal = existing.quantity * existing.selling_price;
    // tax is already included in price, so if you want to show it separately:
    existing.tax = existing.subtotal * gstRate;
    existing.total_price = +(existing.subtotal - existing.discount).toFixed(2);
  } else {
    // push all the fields your table & API expect
    console.log("Checking gst value", product.selling_price * 1 * 0.1);
    cart.value.push({
      id: product.id,
      name: product.name,
      selling_price: product.selling_price,
      quantity: 1,
      discount: 0,
      // if you prefer default tax = 0 and handle later, just leave it 0
      tax: product.selling_price * 1 * gstRate,
      subtotal: product.selling_price * 1,
      total_price: product.selling_price * 1,
    });
  }
};
const removeFromCart = (idx) => cart.value.splice(idx, 1);

// Customer operations
const selectCustomer = (c) => {
  selectedCustomer.value = c;
  searchQuery.value = "";
};
const clearCustomer = () => (selectedCustomer.value = null);

// API call
const createSales = async (method) => {
  const saleData = {
    customer_id: selectedCustomer.value?.id || null,
    items: cart.value.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.selling_price,
      subtotal: item.subtotal,
      discount: item.discount,
      tax: item.tax,
      total_price: item.total_price,
    })),
    // unwrap the computed refs here
    subtotal: subtotal.value,
    gst: totalTax.value,
    discount: totalDisc.value,
    total: grandTotal.value,
    payment_method: method,
    bank_amount: eftpos.value,
    cash_amount: cash.value,
    change_amount: changeAmount.value,
    date: new Date().toISOString(),
  };

  const res = await fetch(baseURL + "/sales", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(saleData),
  });
  if (!res.ok) throw new Error("Failed to process sale");
};

// Confirm with loader
const confirmSale = async (method) => {
  loading.value = true;
  try {
    await createSales(method);
    setTimeout(() => {
      loading.value = false;
      success.value = true;
      
      selectedCustomer.value = null;
    }, 1000);
  } catch (err) {
    console.error(err);
    alert("Error processing sale. Please try again.");
  } finally {
    loading.value = false;
  }
};

// Reset modal state
const resetForm = () => {
  discount.value = 0;
  eftpos.value = "";
  cash.value = "";
  loading.value = false;
  success.value = false;
  dialogOpen.value = false;
  // clear cart and customer
  cart.value = [];
};

// Receipt actions
const printReceipt = () => {
  const receipt = document.getElementById("printable-receipt");
  if (!receipt) return alert("Receipt content not found!");

  const printWindow = window.open("", "_blank");
  const styles = `
    <style>
      @media print {
        body {
          margin: 0;
          padding: 0;
          font-family: monospace;
          font-size: 11px;
        }
        .receipt-container {
          width: 80mm;
          padding: 4mm;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          text-align: left;
          padding: 2px 0;
        }
        th {
          border-bottom: 1px solid #000;
        }
        td {
          border-bottom: 1px dashed #aaa;
        }
      }
    </style>
  `;
  printWindow.document.write(`
    <html>
      <head><title>Sales Receipt</title>${styles}</head>
      <body>${receipt.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};
const newSale = () => resetForm();
</script>

<template>
  <div class="mt-14 relative">
    <div class="flex min-h-[calc(100vh-60px)]">
      <!-- Left: Cart -->
      <div class="w-1/2 border-r bg-gray-100 p-8 flex flex-col justify-between">
        <!-- Customer Search -->
        <div>
          <div class="mb-4 relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search Customer Name..."
              class="input-field w-full" />
            <ul
              v-if="filteredCustomers.length"
              class="absolute top-10 z-50 w-full bg-gray-50 border border-gray-300 rounded-lg">
              <li
                v-for="c in filteredCustomers"
                :key="c.id"
                @click="selectCustomer(c)"
                class="p-2 hover:bg-gray-100 cursor-pointer">
                {{ c.name }} – {{ c.phone }}
              </li>
            </ul>
          </div>
          <div
            v-if="selectedCustomer"
            class="mb-4 p-4 bg-stone-100 rounded flex justify-between items-center">
            <div>
              <p class="font-semibold text-sm">
                Customer: {{ selectedCustomer.name }}
              </p>
              <p class="text-sm font-semibold">
                Phone: {{ selectedCustomer.phone }}
              </p>
            </div>
            <button
              @click="clearCustomer"
              class="text-red-500">
              &times;
            </button>
          </div>

          <Table>
            <TableHeader>
              <TableRow class="bg-white">
                <TableHead class="text-left"> Qty </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>GST</TableHead>
                <TableHead class="text-right"> Total </TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="(item, i) in cart"
                :key="i">
                <TableCell class="font-medium">
                  <input
                    type="number"
                    min="1"
                    v-model.number="item.quantity"
                    class="w-10 text-center" />
                </TableCell>
                <TableCell>{{ item.name }}</TableCell>
                <TableCell>
                  <div>
                    <span>${{ item.selling_price }}</span> <span></span>
                  </div>

                  <AlertDialog
                    ><AlertDialogTrigger asChild>
                      <button
                        class="text-xs text-blue-400 cursor-pointer hover:underline">
                        {{
                          item.discount
                            ? "Discount - $" + item.discount
                            : "Add Discount"
                        }}
                      </button></AlertDialogTrigger
                    >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle> Discount </AlertDialogTitle>
                        <AlertDialogDescription>
                          <input
                            type="text"
                            class="input-field"
                            min="0"
                            v-model="item.discount"
                            placeholder="Enter discount amount..." />
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction class="primary-btn">
                          Apply
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
                <TableCell>${{ item.tax.toFixed(2) }}</TableCell>
                <TableCell class="text-right"
                  >${{ item.total_price.toFixed(2) }}</TableCell
                >
                <TableCell>
                  <button
                    @click="removeFromCart(i)"
                    class="text-red-500">
                    &times;
                  </button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Totals -->
        <div>
          <div
            class="bg-white px-6 py-4 mb-4 rounded-md shadow border border-gray-100 flex flex-col gap-2">
            <h3
              class="flex justify-between items-center text-sm font-semibold mb-1">
              <span>Subtotal:</span>
              <span>
                $
                <input
                  type="number"
                  v-model.number="subtotal"
                  class="w-20 text-right border p-1 border-gray-200"
              /></span>
            </h3>
            <h3 class="flex justify-between items-center text-sm font-semibold">
              <span>Discount:</span>
              <span>
                $
                <input
                  type="number"
                  v-model.number="totalDisc"
                  class="w-20 text-right border p-1 border-gray-200" />
              </span>
            </h3>
            <h3 class="flex justify-between items-center text-sm font-semibold">
              <span>GST (10%):</span>
              <span
                >$
                <input
                  type="number"
                  v-model.number="totalTax"
                  class="w-20 text-right border p-1 border-gray-200"
                  disabled />
              </span>
            </h3>
          </div>

          <div
            class="bg-white shadow-sm py-4 px-6 rounded-sm border border-gray-100">
            <h3 class="flex items-center justify-between text-lg font-semibold">
              <span>Total ($):</span>
              <span>
                <input
                  type="number"
                  v-model.number="grandTotal"
                  class="min-w-20 max-w-32 text-right p-1"
                  disabled
              /></span>
            </h3>
          </div>
        </div>
      </div>

      <!-- Right: Products & Actions -->
      <div class="w-1/2 py-8 px-8 flex flex-col justify-between">
        <PosView @addToCart="addToCart" />
        <div class="grid grid-cols-2 gap-3">
          <NuxtLink to="/repairs" target="_blank" class="global-btn">View Tickets</NuxtLink>
          <NuxtLink
            to="/repairs/create"
            target="_blank"
            class="py-6 px-6 text-lg rounded-lg border border-solid border-blue-200 bg-blue-500 hover:bg-blue-600 text-white text-center font-semibold shadow-xs transition duration-500">
            Create Ticket
          </NuxtLink>
          <button
            @click="resetForm"
            class="py-6 px-6 text-lg font-semibold bg-red-200 text-red-600 rounded-lg border border-red-200 transition duration-500 hover:bg-red-600 hover:text-white">
            Cancel
          </button>

          <button
            class="py-6 px-6 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg border border-blue-200 shadow-xs transition duration-500"
            @click="dialogOpen = true"
            :disabled="cart.length < 1">
            Checkout
          </button>

          <div
            v-if="dialogOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div class="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg">
              <!-- Header -->
              <div class="mb-4">
                <h2 class="text-2xl font-bold">Sales Checkout</h2>
              </div>

              <!-- Form vs Success -->
              <div v-if="!success">
                <div class="flex flex-col items-center gap-2">
                  <h4 class="text-xl font-semibold uppercase text-black">
                    Amount
                  </h4>
                  <h2 class="text-5xl font-semibold text-green-500">
                    ${{ grandTotal }}
                  </h2>
                </div>
                <div class="mt-4 space-y-4">
                  <div class="flex flex-col gap-2">
                    <label class="font-semibold">Eftpos</label>
                    <input
                      v-model="eftpos"
                      type="number"
                      placeholder="Enter Amount"
                      class="input-field w-full" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="font-semibold">Cash</label>
                    <input
                      v-model="cash"
                      type="number"
                      placeholder="Enter Amount"
                      class="input-field w-full" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="font-semibold">Change</label>
                    <input
                      :value="changeAmount"
                      readonly
                      placeholder="Return Amount"
                      class="input-field w-full" />
                  </div>
                </div>
              </div>

              <div
                v-else
                class="flex flex-col items-center py-6 gap-4">
                <svg
                  class="w-16 h-16 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 10-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414L9 13.414l4.707-4.707z"
                    clip-rule="evenodd" />
                </svg>
                <h3 class="text-2xl font-semibold">Purchase Successful!</h3>
              </div>

              <div class="flex justify-end space-x-4 mt-4">
                <template v-if="!success">
                  <button
                    @click="resetForm"
                    class="px-4 py-2 border text-sm leading-0 rounded-lg hover:bg-gray-100 font-semibold">
                    Cancel
                  </button>
                  <button
                    @click="confirmSale('bank')"
                    :disabled="loading"
                    class="primary-btn !m-0">
                    <span
                      v-if="loading"
                      class="loader mr-2"></span>
                    <span>{{ loading ? "Processing…" : "Confirm" }}</span>
                  </button>
                </template>
                <template v-else>
                  <button
                    @click="printReceipt"
                    class="py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold">
                    Print Receipt
                  </button>
                  <button
                    @click="newSale"
                    class="py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold">
                    New Sale
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Hidden Receipt Template -->
    <div
      id="printable-receipt"
      class="hidden">
      <div class="receipt-container !w-[80mm] !p-[4mm] !text-[11px]">
        <h2 class="text-xl font-bold text-center mb-2">Dreamify POS Receipt</h2>
        <p class="text-sm text-center mb-4">
          Date: {{ new Date().toLocaleString() }}
        </p>

        <div
          v-if="selectedCustomer"
          class="mb-4">
          <p><strong>Customer:</strong> {{ selectedCustomer.name }}</p>
          <p><strong>Phone:</strong> {{ selectedCustomer.phone }}</p>
        </div>

        <table class="w-full text-sm border-t border-b border-black mb-4">
          <thead>
            <tr class="text-left border-b border-black">
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Disc</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in cart"
              :key="index"
              class="border-b border-dashed">
              <td>{{ item.name }}</td>
              <td>{{ item.quantity }}</td>
              <td>${{ item.selling_price }}</td>
              <td>${{ (item.discount || 0) }}</td>
              <td>${{ item.total_price }}</td>
            </tr>
          </tbody>
        </table>

        <div class="text-right text-sm space-y-1">
          <p><strong>Subtotal:</strong> ${{ subtotal }}</p>
          <p><strong>Discount:</strong> ${{ totalDisc }}</p>
          <p><strong>GST (10%):</strong> ${{ totalTax }}</p>
          <p class="text-lg font-bold">Grand Total: ${{ grandTotal }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loader {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
