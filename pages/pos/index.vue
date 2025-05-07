<script setup>
import { ref, computed, onMounted } from "vue";
import CreateRepair from "~/components/shared/CreateRepair.vue";
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

import { Input } from '@/components/ui/input'

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
const eftpos = ref("");
const cash = ref("");
const loading = ref(false);
const success = ref(false);

// Computed values
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return [];
  return customerStore.customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
const subtotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.selling_price * item.quantity, 0)
);
const gstAmount = computed(() => (subtotal.value * 0.1).toFixed(2));
const finalTotal = computed(() => (subtotal.value - discount.value).toFixed(2));
const changeAmount = computed(() => {
  const paid = parseFloat(eftpos.value || 0) + parseFloat(cash.value || 0);
  return paid > parseFloat(finalTotal.value)
    ? (paid - parseFloat(finalTotal.value)).toFixed(2)
    : "0.00";
});

// Lifecycle
onMounted(() => {
  categoryStore.fetchCategories();
  productStore.fetchProducts();
  customerStore.fetchCustomers();
});

// Cart operations
const addToCart = (product) => {
  const existing = cart.value.find((i) => i.id === product.id);
  if (existing) existing.quantity++;
  else cart.value.push({ ...product, quantity: 1 });
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
    })),
    subtotal: subtotal.value.toString(),
    gst: gstAmount.value,
    discount: discount.value,
    total: finalTotal.value,
    payment_method: method,
    date: new Date().toISOString(),
  };
  const res = await fetch("http://127.0.0.1:8000/api/sales", {
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
    success.value = true;
    // clear cart and customer
    cart.value = [];
    selectedCustomer.value = null;
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
};

// Receipt actions
const printReceipt = () => window.print();
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
                  <input type="number" min="1" :value="item.quantity" class="w-10 text-center">
                </TableCell>
                <TableCell>{{ item.name }}</TableCell>
                <TableCell>{{ item.selling_price }}</TableCell>
                <TableCell>{{ (item.selling_price * 0.1).toFixed(2) }}</TableCell>
                <TableCell class="text-right">{{ (item.selling_price * item.quantity).toFixed(2) }}</TableCell>
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
                  v-model.number="discount"
                  class="w-20 text-right border p-1 border-gray-200" />
              </span>
            </h3>
            <h3 class="flex justify-between items-center text-sm font-semibold">
              <span>GST (10%):</span>
              <span
                >$
                <input
                  type="number"
                  v-model.number="gstAmount"
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
                  v-model.number="finalTotal"
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
        <div class="grid grid-cols-3 gap-6">
          <button class="global-btn">View Tickets</button>
          <button class="global-btn">View Invoices</button>
          <NuxtLink
            to="/repairs/create"
            target="_blank"
            class="py-6 px-6 text-lg rounded-lg border border-solid border-blue-200 bg-blue-500 hover:bg-blue-600 text-white text-center font-semibold shadow-xs transition duration-500">
            Create Ticket
          </NuxtLink>
          <button
            class="py-6 px-6 text-lg font-semibold bg-gray-100 text-gray-700 rounded-lg border transition duration-500 hover:bg-blue-600 hover:text-white">
            More Actions
          </button>
          <button
            @click="resetForm"
            class="py-6 px-6 text-lg font-semibold bg-red-200 text-red-600 rounded-lg border border-red-200 transition duration-500 hover:bg-red-600 hover:text-white">
            Cancel
          </button>
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <button
                class="py-6 px-6 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg border border-blue-200 shadow-xs transition duration-500"
                :disabled="cart.length < 1">
                Checkout
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sales Checkout</AlertDialogTitle>
              </AlertDialogHeader>

              <!-- Form vs Success -->
              <AlertDialogDescription v-if="!success">
                <div class="flex flex-col items-center gap-2">
                  <h4 class="text-xl font-semibold uppercase text-black">
                    Amount
                  </h4>
                  <h2 class="text-5xl font-semibold text-green-500">
                    ${{ finalTotal }}
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
              </AlertDialogDescription>

              <AlertDialogDescription
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
                <h3 class="text-2xl font-semibold">Payment Successful!</h3>
              </AlertDialogDescription>

              <AlertDialogFooter class="space-x-4">
                <template v-if="!success">
                  <AlertDialogCancel @click="resetForm"
                    >Cancel</AlertDialogCancel
                  >
                  <AlertDialogAction
                    @click="confirmSale('bank')"
                    :disabled="loading"
                    class="primary-btn flex items-center justify-center">
                    <span
                      v-if="loading"
                      class="loader mr-2"></span>
                    <span>{{ loading ? "Processing…" : "Confirm" }}</span>
                  </AlertDialogAction>
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
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
