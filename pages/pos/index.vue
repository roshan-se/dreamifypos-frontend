<script setup>
import { ref, computed, onMounted } from "vue";

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
</script>

<template>
  <div class="mt-14 relative">
    <div class="flex min-h-[calc(100vh-60px)]">
      <!-- Left Section: Shopping Cart -->
      <div
        class="relative w-1/3 border-r border-gray-200 px-4 py-8 flex flex-col justify-between">
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
                <th
                  scope="col"
                  class="px-6 py-3">
                  Product
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-center">
                  Qty
                </th>
                <th
                  scope="col"
                  class="px-6 py-3">
                  Price
                </th>
                <th
                  scope="col"
                  class="px-6 py-3">
                  Total
                </th>
                <th
                  scope="col"
                  class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in cart"
                :key="index"
                class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200 text-sm">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {{ item.name }}
                </td>
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
                  ${{ item.selling_price }}
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  ${{ item.selling_price * item.quantity }}
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  <button
                    @click="removeFromCart(index)"
                    class="text-red-500">
                    X
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 w-full border-t border-dashed border-gray-300 pt-4">
          <h3 class="text-sm font-semibold flex justify-between">
            <span>Subtotal: </span> <span>${{ subtotal }}</span>
          </h3>
          <h3 class="text-sm font-semibold flex justify-between">
            <span>GST (10%): </span> <span>${{ gstAmount }}</span>
          </h3>
          <h3 class="text-sm font-semibold flex justify-between">
            <span>Discount: </span>
            <span>{{ discount ? `${discount}` : "$0.00" }}</span>
          </h3>
          <h3 class="text-sm font-semibold flex justify-between">
            <span>Total: </span> <span>${{ finalTotal }}</span>
          </h3>
        </div>
      </div>

      <!-- Right Section: Categories & Products -->
      <div class="w-2/3 py-8 px-8 flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-bold mb-4">Categories</h2>
          <div class="grid grid-cols-4 xl:grid-cols-6 gap-4 border-b border-gray-200 pb-4">
            <div
              v-for="category in categoryStore.categories"
              :key="category.id"
              class="bg-white border border-dashed border-gray-300 px-4 py-6 text-sm xl:text-base font-semibold text-center rounded cursor-pointer hover:bg-blue-300 hover:border-solid min-h-25 flex items-center justify-center" 
              @click="selectCategory(category.id)">
              {{ category.name }}
            </div>
          </div>
          <div v-if="selectedCategory">
            <h2 class="text-lg font-bold mt-6">Products</h2>
            <div class="grid grid-cols-5 gap-4 mt-2">
              <div
                v-for="product in filteredProducts"
                :key="product.id"
                class="bg-white shadow p-4 rounded cursor-pointer hover:bg-gray-100 min-h-25"
                @click="addToCart(product)">
                <h3 class="text-sm font-semibold capitalize">
                  {{ product.name }}
                </h3>
                <p class="text-gray-600">${{ product.selling_price }}</p>
              </div>
            </div>
          </div>
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
    <!-- Main modal -->
    <div
      v-if="openModal"
      class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center content-center w-full md:inset-0 h-full max-h-full bg-black/70">
      <div class="relative p-4 w-full max-w-2xl m-auto">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          <!-- Modal header -->
          <div
            class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              Sales Checkout
            </h3>
            <button
              @click="toggleModal"
              type="button"
              class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
          <div class="p-4 md:p-5">
            <div class="space-y-4">
              <div>
                <h4 class="text-center text-2xl text-slate-500">
                  Total Amount Pending
                </h4>
                <h2
                  class="text-center text-5xl font-semibold text-green-500 py-6">
                  ${{ finalTotal }}
                </h2>
              </div>
              <div class="flex items-center gap-4">
                <button
                  @click="createSales('bank')"
                  type="button"
                  class="primary-btn w-full">
                  Bank Payment
                </button>
                <button
                  @click="createSales('cash')"
                  type="button"
                  class="secondary-btn w-full bg-stone-500">
                  Cash Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
