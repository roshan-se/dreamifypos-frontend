<script setup>
import { ref, computed, onMounted } from "vue";
import CreateRepair from "~/components/shared/CreateRepair.vue";
import PosView from "~/components/shared/PosView.vue";

definePageMeta({
  layout: "pos-layout",
});

const openModal = ref(false);

const categoryStore = useCategoryStore();
const productStore = useProductStore();

// Selected category state
const selectedCategory = ref(null);

// Cart state
const cart = ref([]);

const toggleModal = () => {
  openModal.value = !openModal.value;
};

// Filtered products based on selected category
const filteredProducts = computed(() => {
  if (!selectedCategory.value) return productStore.products;
  return productStore.products.filter(
    (p) => p.category_id === selectedCategory.value
  );
});

// Compute total cart price
const cartTotal = computed(() => {
  return cart.value
    .reduce((total, item) => total + item.selling_price * item.quantity, 0)
    .toFixed(2);
});

// Select category
const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId;
};

// Add product to cart
const addToCart = (product) => {
  const existingItem = cart.value.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.value.push({ ...product, quantity: 1 });
  }
};

// Remove product from cart
const removeFromCart = (index) => {
  cart.value.splice(index, 1);
};

// Checkout function
const checkout = () => {
  alert("Proceeding to checkout!");
};

const discount = ref(0); // Default discount amount

const subtotal = computed(() => {
  return cart.value
    .reduce((total, item) => total + item.selling_price * item.quantity, 0)
    .toFixed(2);
});

const gstAmount = computed(() => {
  return (subtotal.value * 0.1).toFixed(2); // GST 10% (already included)
});

const finalTotal = computed(() => {
  return (subtotal.value - discount.value).toFixed(2);
});

const customerStore = useCustomerStore();

const searchQuery = ref("");
const selectedCustomer = ref(null);

// Filter customers based on search query
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return [];
  return customerStore.customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Select a customer
const selectCustomer = (customer) => {
  selectedCustomer.value = customer;
  searchQuery.value = ""; // Clear search input
};

// Remove selected customer
const clearCustomer = () => {
  selectedCustomer.value = null;
};

onMounted(() => {
  categoryStore.fetchCategories();
  productStore.fetchProducts();
  customerStore.fetchCustomers();
});

const paymentMethod = ref(null);

const createSales = async (payment) => {
  if (cart.value.length === 0) {
    alert("Cart is empty!");
    return;
  }
  paymentMethod.value = payment;

  // if (!paymentMethod.value) {
  //   alert("Please select a payment method.");
  //   return;
  // }

  const saleData = {
    customer_id: selectedCustomer.value ? selectedCustomer.value.id : null,
    items: cart.value.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.selling_price,
    })),
    subtotal: subtotal.value,
    gst: gstAmount.value,
    discount: discount.value,
    total: finalTotal.value,
    payment_method: paymentMethod.value, // 'cash' or 'bank'
    date: new Date().toISOString(),
  };

  try {
    const response = await fetch("http://127.0.0.1:8000/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saleData),
    });

    if (!response.ok) throw new Error("Failed to process sale");

    alert("Sale processed successfully!");
    cart.value = []; // Clear cart after sale
    selectedCustomer.value = null; // Reset customer selection
    paymentMethod.value = null; // Reset payment method
    toggleModal(); // Close modal
  } catch (error) {
    console.error("Error processing sale:", error);
    alert("Error processing sale. Please try again.");
  }
};


const openRepairModal = ref(false);

const toggleRepairModal = (value) => {
  openRepairModal.value = value
}


</script>

<template>
  <div class="mt-14 relative">
    <div class="flex min-h-[calc(100vh-60px)]">
      <!-- Left Section: Shopping Cart -->
      <div
        class="relative w-1/2 border-r border-gray-200 bg-gray-100 px-4 py-8 flex flex-col justify-between">
        <div>
          <!-- Search Customer -->
          <div class="mb-4 flex gap-4">
            <div class="w-full relative">
              <input
                type="text"
                v-model="searchQuery"
                @input="searchCustomers"
                class="input-field"
                placeholder="Search Customer Name..." />
              <ul
                v-if="filteredCustomers.length"
                class="mt-2 absolute top-10 z-50 w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg">
                <li
                  v-for="customer in filteredCustomers"
                  :key="customer.id"
                  @click="selectCustomer(customer)"
                  class="p-2 hover:bg-gray-100 cursor-pointer">
                  {{ customer.name }} - {{ customer.phone }}
                </li>
              </ul>
            </div>

            <button
              type="button"
              class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 cursor-pointer w-max">
              +
            </button>
          </div>

          <!-- Selected Customer Details -->
          <div
            v-if="selectedCustomer"
            class="relative p-4 bg-stone-100 rounded mb-4 flex justify-between items-center">
            <div>
              <p class="font-semibold text-sm">
                Customer: {{ selectedCustomer.name }}
              </p>
              <p class="text-sm font-semibold">
                Phone Number: {{ selectedCustomer.phone }}
              </p>
            </div>

            <button
              @click="clearCustomer"
              class="text-red-500 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <table
            class="relative table-fixed w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead
              class="w-full text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr class="">
                <th class="w-[10%] px-6 py-3 text-center">Qty</th>
                <th
                  scope="col"
                  class="w-[35%] px-6 py-3">
                  Product
                </th>

                <th
                  scope="col"
                  class="w-[15%] px-6 py-3">
                  Price
                </th>
                <th
                  scope="col"
                  class="w-[15%] px-6 py-3">
                  Tax
                </th>
                <th
                  scope="col"
                  class="w-[15%] px-6 py-3">
                  Total
                </th>
                <th
                  scope="col"
                  class="w-[10%] px-2 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in cart"
                :key="index"
                class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200 text-sm">
                <td
                  class="px-6 py-4 font-medium text-gray-900 dark:text-white text-center">
                  <!-- <input
                  type="number"
                  v-model="item.quantity"
                  class="w-12 border p-1 text-center"
                  min="1" /> -->
                  {{ item.quantity }}
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  <span class="line-clamp-1">{{ item.name }}</span>
                </td>

                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  ${{ item.selling_price }}
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  ${{ item.selling_price * 0.1 }}
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  ${{ item.selling_price * item.quantity }}
                </td>
                <td class="px-2 py-4 font-medium text-gray-900 dark:text-white">
                  <button
                    @click="removeFromCart(index)"
                    class="text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-5">
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
        <div>
          <div
            class="mt-4 w-full border-gray-100 rounded-sm bg-white px-6 py-4 mb-4 pt-4 flex flex-col">
            <h3 class="text-sm font-semibold flex justify-between">
              <span>Discount: </span>
              <span>{{ discount ? `${discount}` : "$0.00" }}</span>
            </h3>
            <h3 class="text-sm font-semibold flex justify-between">
              <span>Subtotal: </span> <span>${{ subtotal }}</span>
            </h3>
            <h3 class="text-sm font-semibold flex justify-between">
              <span>Tax: </span> <span>${{ gstAmount }}</span>
            </h3>
          </div>
          <div
            class="bg-white shadow-sm py-4 px-6 rounded-sm border border-gray-100">
            <h3 class="text-lg font-semibold flex justify-between">
              <span>Total: </span> <span>${{ finalTotal }}</span>
            </h3>
          </div>
        </div>
      </div>

      <!-- Right Section: Categories & Products -->
      <div class="w-1/2 py-8 px-8 flex flex-col justify-between">
        <div>
          <PosView @addToCart="addToCart" />
        </div>

        <div class="grid grid-cols-3 gap-6">
          <button
            class="py-6 px-6 bg-gray-100 text-lg rounded-lg border border-solid border-gray-100 text-gray-700 cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:bg-sky-600 hover:text-white">
            View Tickets
          </button>
          <button
            class="py-6 px-6 bg-gray-100 text-lg rounded-lg border border-solid border-gray-100 text-gray-700 cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:bg-blue-600 hover:text-white">
            View Invoices
          </button>
          <button
          @click="() => toggleRepairModal(true)"
            class="py-6 px-6 text-lg rounded-lg border border-solid border-blue-200 cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 bg-blue-500 hover:bg-blue-600 text-white">
            Create Ticket
          </button>
          <button
            class="py-6 px-6 bg-gray-100 text-lg rounded-lg border border-solid border-gray-100 text-gray-700 cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:bg-blue-600 hover:text-white">
            More Actions
          </button>
          <button
            class="py-6 px-6 text-lg rounded-lg border border-solid border-red-200 cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 bg-red-200 hover:bg-red-600 text-red-600 hover:text-white"
            :class="cart.length < 1 ? 'opacity-50' : ''"
            :disabled="cart.length < 1"
            @click="toggleModal">
            Cancel
          </button>
          <button
            class="py-6 px-6 text-lg rounded-lg border border-solid border-blue-200 cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 bg-green-500 hover:bg-green-600 text-white"
            :class="cart.length < 1 ? 'opacity-50' : ''"
            :disabled="cart.length < 1"
            @click="toggleModal">
            Checkout
          </button>
        </div>
      </div>
    </div>
    <!-- Repair modal  -->
      <CreateRepair :openRepairModal="openRepairModal" />
    <!-- End Repair Modal  -->


    <!-- Main modal -->
    <div
      v-if="openModal"
      class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center content-center w-full md:inset-0 h-full max-h-full bg-black/70">
      <div class="relative p-4 w-full max-w-xl m-auto">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          <!-- Modal header -->
          <div class="flex items-center justify-end pr-5 pt-2">
            <button
              @click="toggleModal"
              type="button"
              class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center cursor-pointer"
              data-modal-hide="authentication-modal">
              <svg
                class="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14">
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <!-- Modal body -->
          <div class="px-8 pb-8 pt-0 flex flex-col gap-6 justify-center">
            <h3 class="text-4xl font-semibold text-gray-900 text-center">
              Sales Checkout
            </h3>
            <div class="flex flex-col gap-4 items-center align-middle">
              <h4 class="text-xl font-semibold text-black uppercase">
                Amount Pending
              </h4>
              <h2 class="text-5xl font-semibold text-green-500">
                ${{ finalTotal }}
              </h2>
            </div>
            <div>
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <label for="" class="font-semibold">Bank</label>
                  <div class="flex-1">
                    <input
                      type="text"
                      placeholder="Enter Amount"
                      class="input-field" />
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <label for="" class="font-semibold">Cash</label>
                  <div class="flex-1">
                    <input
                      type="text"
                      placeholder="Enter Amount"
                      class="input-field" />
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <label for="" class="font-semibold">Change</label>
                  <div class="flex-1">
                    <input
                      type="text"
                      placeholder="Return Amount"
                      class="input-field" />
                  </div>
                </div>

                <button
                  @click="createSales('bank')"
                  type="button"
                  class="primary-btn w-full">
                  Confirm Payment
                </button>
                <!-- <button
                  @click="createSales('cash')"
                  type="button"
                  class="secondary-btn w-full bg-stone-500">
                  Cash Payment
                </button> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
