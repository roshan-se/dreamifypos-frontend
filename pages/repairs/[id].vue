<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { Button } from "@/components/ui/button";

const runtimeConfig = useRuntimeConfig();
const baseURL = runtimeConfig.public.apiBase;

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const customerStore = useCustomerStore();
const productStore = useProductStore();
const employeeStore = useEmployeeStore();
const repairStore = useRepairStore();
const categoryStore = useCategoryStore();

const errors = ref("");
const searchQuery = ref("");
const selectedCustomer = ref(null);
const cart = ref([]);

const repairFormData = reactive({
  customer_id: null,
  device_model: "",
  imei: "",
  passcode: "",
  description: "",
  status: "pending",
  payment_status: "",
  deposit_amount: 0,
  total_cost: 0,
  assigned_to: null,
  repair_items: [],
});

// Category navigation states
const currentCategory = ref(null);
const childCategories = ref([]);
const products = ref([]);
const categoryHistory = ref([]);

// Watch for cart change to update total cost
watch(
  cart,
  (newCart) => {
    repairFormData.total_cost = newCart.reduce((sum, it) => {
      const lineTotal = it.selling_price * it.quantity - (it.discount || 0);
      return sum + lineTotal;
    }, 0);
  },
  { deep: true }
);

// Computed for customer search
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return [];
  return customerStore.customers.filter((c) =>
    `${c.name} ${c.phone}`
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())
  );
});

// Category logic
const fetchSubcategoriesAndProducts = async (category) => {
  try {
    const response = await $fetch(baseURL + `/child-categories/${category.id}`);
    const data = await response;

    // Update state
    childCategories.value = data.subcategories;
    products.value = data.products;

    // Prevent duplicate entries in history
    if (!categoryHistory.value.some((c) => c.id === category.id)) {
      categoryHistory.value.push(category);
    }

    currentCategory.value = category;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const goBack = () => {
  if (categoryHistory.value.length > 1) {
    categoryHistory.value.pop();
    const previous = categoryHistory.value[categoryHistory.value.length - 1];
    fetchSubcategoriesAndProducts(previous);
  } else {
    resetView();
  }
};

const resetView = () => {
  currentCategory.value = null;
  childCategories.value = [];
  products.value = [];
  categoryHistory.value = [];
};

// Customer selection
function selectCustomer(customer) {
  repairFormData.customer_id = customer.id;
  selectedCustomer.value = customer;
  searchQuery.value = customer.name;
}

function clearCustomer() {
  repairFormData.customer_id = null;
  selectedCustomer.value = null;
  searchQuery.value = "";
}

// Cart logic
function addToCart(product) {
  const existing = cart.value.find((i) => i.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.value.push({ ...product, quantity: 1, discount: 0 });
  }
}

function removeFromCart(index) {
  cart.value.splice(index, 1);
}

// Submit update
async function handleUpdateRepair() {
  if (!repairFormData.customer_id) {
    errors.value = "Please select a customer.";
    useToastify(errors.value, { type: "error" });
    return;
  }

  repairFormData.repair_items = cart.value.map((it) => ({
    product_id: it.id,
    quantity: it.quantity,
    price: it.selling_price,
    discount: it.discount || 0,
    tax: 0,
    subtotal: it.quantity * it.selling_price,
    total_price: it.quantity * it.selling_price - (it.discount || 0),
  }));

  const res = await repairStore.updateRepair(id, { ...repairFormData });

  if (res.errors) {
    errors.value = Object.values(res.errors)[0][0];
    useToastify(errors.value, { type: "error" });
  } else {
    useToastify("Repair updated successfully!", { type: "success" });
    router.push("/repairs");
  }
}

// Initial load
async function loadData() {
  await Promise.all([
    customerStore.fetchCustomers(),
    productStore.fetchProducts(),
    employeeStore.fetchEmployees(),
    categoryStore.fetchCategories(),
    categoryStore.fetchParentCategories(),
  ]);

  const res = await repairStore.fetchRepair(id);
  const r = res.data || res.data?.data;

  repairFormData.customer_id = r.customer_id;
  selectedCustomer.value = customerStore.customers.find(
    (c) => c.id === r.customer_id
  );
  searchQuery.value = selectedCustomer.value?.name || "";
  repairFormData.device_model = r.device_model;
  repairFormData.imei = r.imei;
  repairFormData.passcode = r.passcode;
  repairFormData.description = r.description;
  repairFormData.status = r.status;
  repairFormData.payment_status = r.payment_status;
  repairFormData.deposit_amount = r.deposit_amount || 0;
  repairFormData.assigned_to = r.assigned_to;

  cart.value = r.items.map((i) => ({
    id: i.product_id,
    name: i.product.name,
    selling_price: i.price,
    quantity: i.quantity,
    discount: i.discount || 0,
  }));
}

onMounted(loadData);
</script>

<template>
  <div class="p-4 border rounded-lg mt-14">
    <div class="flex justify-between mb-6">
      <h1 class="text-xl font-semibold">Edit Repair</h1>
      <router-link
        to="/repairs"
        class="text-red-500"
        >Cancel</router-link
      >
    </div>

    <div class="grid grid-cols-12 gap-6">
      <!-- LEFT PANEL -->
      <div class="col-span-5 space-y-4">
        <!-- Customer Search -->
        <div class="flex items-center gap-2">
          <div class="relative w-full">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search customer..."
              class="w-full border rounded px-4 py-2 text-sm disabled:bg-gray-100"
              :disabled="selectedCustomer" />
            <div
              v-if="filteredCustomers.length && !selectedCustomer"
              class="absolute z-50 mt-1 w-full bg-white border rounded shadow-md max-h-60 overflow-auto">
              <ul>
                <li
                  v-for="customer in filteredCustomers"
                  :key="customer.id"
                  @click="selectCustomer(customer)"
                  class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                  {{ customer.name }} • {{ customer.phone }}
                </li>
              </ul>
            </div>
          </div>
          <Button class="h-full flex flex-col">+</Button>
        </div>

        <!-- Selected Customer Card -->
        <div v-if="selectedCustomer">
          <div class="p-6 shadow-md rounded-md flex justify-between">
            <div>
              <h3 class="text-xl font-bold">{{ selectedCustomer.name }}</h3>
              <p class="text-xs text-green-500">
                Phone Number: {{ selectedCustomer.phone }}
              </p>
            </div>
            <Button
              variant="destructive"
              v-if="repairFormData.customer_id"
              @click="clearCustomer"
              class="cursor-pointer">
              Clear
            </Button>
          </div>
        </div>

        <!-- Technician -->
        <div>
          <label class="block mb-1">Assign Technician</label>
          <select
            v-model="repairFormData.assigned_to"
            class="input-field w-full">
            <option
              disabled
              value="">
              Select Technician...
            </option>
            <option
              v-for="e in employeeStore.employees"
              :key="e.id"
              :value="e.id">
              {{ e.name }}
            </option>
          </select>
        </div>

        <!-- Status and Payment -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1">Status</label>
            <select
              v-model="repairFormData.status"
              class="input-field w-full">
              <option value="pending">Pending</option>
              <option value="waiting">Waiting for parts</option>
              <option value="arrived">Parts Arrived</option>
              <option value="completed">Completed</option>
              <option value="collected">Collected</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Payment Status</label>
            <select
              v-model="repairFormData.payment_status"
              class="input-field w-full">
              <option
                disabled
                value="">
                Select...
              </option>
              <option value="pending_payment">Pending Payment</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="fully_paid">Full Paid</option>
              <option value="not_paid">Not Paid</option>
            </select>
          </div>
        </div>

        <div v-if="repairFormData.payment_status === 'deposit_paid'">
          <label class="block mb-1">Deposit Amount</label>
          <input
            type="number"
            v-model.number="repairFormData.deposit_amount"
            class="input-field w-full" />
        </div>

        <!-- Device Details -->
        <div>
          <label class="block mb-1">Device Model</label>
          <input
            type="text"
            v-model="repairFormData.device_model"
            class="input-field w-full" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1">IMEI / Serial</label>
            <input
              type="text"
              v-model="repairFormData.imei"
              class="input-field w-full" />
          </div>
          <div>
            <label class="block mb-1">Passcode</label>
            <input
              type="text"
              v-model="repairFormData.passcode"
              class="input-field w-full" />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block mb-1">Description</label>
          <textarea
            v-model="repairFormData.description"
            class="input-field w-full"
            rows="3" />
        </div>

        <!-- Total Cost -->
        <div>
          <label class="block mb-1">Total Cost</label>
          <input
            :value="`$${repairFormData.total_cost.toFixed(2)}`"
            disabled
            class="input-field w-full" />
        </div>

        <button
          @click="handleUpdateRepair"
          class="primary-btn w-full">
          Save Changes
        </button>
        <div
          v-if="errors"
          class="text-red-600 mt-2">
          {{ errors }}
        </div>
      </div>

      <!-- RIGHT PANEL -->
      <div class="col-span-7">
        <h2 class="font-semibold mb-4">Select Repair Items</h2>

        <!-- Category Breadcrumb -->
        <div
          v-if="categoryHistory.length"
          class="mb-4">
          <button
            @click="goBack"
            class="text-blue-600 hover:underline mr-2">
            ← Back
          </button>
          <span
            v-for="(cat, i) in categoryHistory"
            :key="cat.id">
            <span v-if="i > 0"> / </span>
            <span
              :class="
                i + 1 === categoryHistory.length
                  ? 'text-green-600 font-semibold'
                  : ''
              ">
              {{ cat.name }}
            </span>
          </span>
        </div>

        <!-- Category Grid -->
        <div
          v-if="childCategories.length || !currentCategory"
          class="grid grid-cols-5 2xl:grid-cols-6 gap-2 pb-8">
          <div
            v-for="category in currentCategory
              ? childCategories
              : categoryStore.parentCategories"
            :key="category.id"
            @click="fetchSubcategoriesAndProducts(category)"
            class="border border-gray-300 rounded-sm text-center cursor-pointer hover:bg-blue-100 py-3 px-2 text-sm font-medium truncate">
            {{ category.name }}
          </div>
        </div>

        <!-- Product Grid -->
        <div
          v-if="products.length"
          class="grid grid-cols-5 gap-2 pb-8">
          <div
            v-for="product in products"
            :key="product.id"
            @click="addToCart(product)"
            class="border p-2 rounded shadow hover:bg-green-400 cursor-pointer text-center">
            <p class="text-sm font-semibold truncate">{{ product.name }}</p>
            <p class="text-xs text-green-500 font-bold">
              ${{ product.selling_price }}
            </p>
          </div>
        </div>

        <!-- Cart -->
        <div
          v-if="cart.length"
          class="mt-6 space-y-4">
          <h3 class="text-lg font-semibold border-b pb-2">Selected Items</h3>

          <ul class="space-y-4">
            <li
              v-for="(item, index) in cart"
              :key="item.id"
              class="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800">
              <!-- Product & Quantity Row -->
              <div class="flex justify-between items-center mb-2">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ index + 1 }}. {{ item.name }}
                  </p>
                  <p class="text-sm text-gray-500">
                    Quantity: {{ item.quantity }}
                  </p>
                </div>
                <button
                  @click="removeFromCart(index)"
                  class="text-sm text-red-600 hover:underline font-medium">
                  Remove
                </button>
              </div>

              <!-- Discount & Line Total Row -->
              <div
                class="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center text-sm">
                <div>
                  <label
                    class="block mb-1 text-gray-700 dark:text-gray-300 font-medium"
                    >Discount ($)</label
                  >
                  <input
                    type="number"
                    v-model.number="item.discount"
                    min="0"
                    class="input-field w-full"
                    placeholder="0.00" />
                </div>
                <div>
                  <label
                    class="block mb-1 text-gray-700 dark:text-gray-300 font-medium"
                    >Unit Price</label
                  >
                  <div
                    class="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded text-gray-800 dark:text-white">
                    ${{ item.selling_price }}
                  </div>
                </div>
                <div>
                  <label
                    class="block mb-1 text-gray-700 dark:text-gray-300 font-medium"
                    >Total</label
                  >
                  <div
                    class="bg-green-50 dark:bg-green-900 px-3 py-2 rounded font-semibold text-green-700 dark:text-green-300">
                    ${{
                      (
                        item.selling_price * item.quantity -
                        item.discount
                      ).toFixed(2)
                    }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
