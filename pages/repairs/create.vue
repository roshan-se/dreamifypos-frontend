<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { Button } from "@/components/ui/button";

const runtimeConfig = useRuntimeConfig();
const baseURL = runtimeConfig.public.apiBase;

const router = useRouter();
const productStore = useProductStore();
const customerStore = useCustomerStore();
const repairStore = useRepairStore();
const employeeStore = useEmployeeStore();
const categoryStore = useCategoryStore();

const branchStore = useBranchStore()

const errors = ref("");
const cart = ref([]);
const searchQuery = ref("");

const selectedCustomer = ref(null);

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
  branch_id: branchStore.activeBranch.id
});

const currentCategory = ref(null);
const childCategories = ref([]);
const products = ref([]);
const categoryHistory = ref([]);

// Recalculate total_cost whenever cart changes (including discounts)
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

const goBack = () => {
  if (categoryHistory.value.length > 1) {
    categoryHistory.value.pop(); // Remove last category
    const previousCategory =
      categoryHistory.value[categoryHistory.value.length - 1];
    fetchSubcategoriesAndProducts(previousCategory);
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

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return [];
  return customerStore.customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

function selectCustomer(customer) {
  repairFormData.customer_id = customer.id;
  searchQuery.value = customer.name;
  selectedCustomer.value = customer;
}

function clearCustomer() {
  repairFormData.customer_id = null;
  searchQuery.value = "";
  selectedCustomer.value = null;
}

function addToCart(product) {
  const existing = cart.value.find((i) => i.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    // include discount placeholder
    cart.value.push({ ...product, quantity: 1, discount: 0 });
  }
}

function removeFromCart(index) {
  cart.value.splice(index, 1);
}

async function handleCreateRepair() {
  errors.value = "";
  if (!repairFormData.customer_id) {
    errors.value = "Please select a customer.";
    Toastify({ text: errors.value, duration: 3000 }).showToast();
    return;
  }

  // prepare repair_items for API
  repairFormData.repair_items = cart.value.map((it) => ({
    product_id: it.id,
    quantity: it.quantity,
    price: it.selling_price,
    discount: it.discount || 0,
    tax: 0,
    subtotal: it.quantity * it.selling_price,
    total_price: it.quantity * it.selling_price - (it.discount || 0),
  }));

  const payload = { ...repairFormData };
  const res = await repairStore.addRepair(payload);
  if (res.errors) {
    errors.value = Object.values(res.errors)[0][0];
    useToastify(Object.values(res.errors)[0][0], {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "error",
    });
  } else {
    useToastify("Repair created successfully!", {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "success",
    });

    router.push("/repairs");
  }
}

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

onMounted(() => {
  categoryStore.fetchCategories();
  categoryStore.fetchParentCategories();
  customerStore.fetchCustomers();
  productStore.fetchProducts();
  employeeStore.fetchEmployees();
});
</script>

<template>
  <div class="p-4 border rounded-lg mt-14">
    <div class="flex justify-between mb-6">
      <h1 class="text-xl font-semibold">New Repair</h1>
      <router-link
        to="/repairs"
        class="text-red-500"
        >Cancel</router-link
      >
    </div>
    <div class="grid grid-cols-12 gap-6">
      <!-- Left Panel -->
      <div class="col-span-5 space-y-4">
        <div class="w-full">
          <!-- Customer Search -->
          <div class="flex items-center gap-2">
            <div class="relative w-full">
              <!-- Search Input -->
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search customer..."
                class="w-full text-sm border rounded px-4 py-2 disabled:opacity-75 disabled:bg-gray-200"
                :disabled="selectedCustomer" />

              <!-- Floating Result Box -->
              <div
                v-if="filteredCustomers.length && selectedCustomer == null"
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
        </div>

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

        <!-- Assign Technician -->
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

        <!-- Status & Payment -->
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
            class="input-field w-full"
            placeholder="0.00" />
        </div>

        <!-- Device Details -->
        <div>
          <label class="block mb-1">Device Model</label>
          <input
            type="text"
            v-model="repairFormData.device_model"
            class="input-field w-full"
            placeholder="e.g. iPhone 12" />
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

        <!-- Description & Total -->
        <div>
          <label class="block mb-1">Description</label>
          <textarea
            v-model="repairFormData.description"
            class="input-field w-full"
            rows="3"></textarea>
        </div>
        <div>
          <label class="block mb-1">Total Cost</label>
          <input
            type="text"
            :value="`$${repairFormData.total_cost.toFixed(2)}`"
            class="input-field w-full"
            disabled />
        </div>

        <button
          @click="handleCreateRepair"
          class="primary-btn w-full">
          Create Ticket
        </button>
        <div
          v-if="errors"
          class="mt-4 text-red-600">
          {{ errors }}
        </div>
      </div>

      <!-- 
      ----------------------------
      Right Panel: Products & Cart
      ----------------------------
      -->
      <div class="col-span-7">
        <h2 class="font-semibold mb-4">Select Repair Items</h2>
        <div
          v-if="categoryHistory.length"
          class="mb-4">
          <button
            @click="goBack"
            class="text-blue-600 hover:underline cursor-pointer mr-4">
            ← Back
          </button>
          <span
            v-for="(category, index) in categoryHistory"
            :key="category.id"
            class="text-lg font-semibold">
            <span v-if="index > 0"> / </span>
            <span
              class="px-2"
              :class="[
                index + 1 == categoryHistory.length ? 'text-green-600' : '',
              ]"
              >{{ category.name }}</span
            >
          </span>
        </div>

        <!-- Parent/Child Categories Grid -->
        <div
          v-if="childCategories.length || !currentCategory"
          class="grid grid-cols-5 2xl:grid-cols-6 gap-2 pb-8">
          <div
            v-for="category in currentCategory
              ? childCategories
              : categoryStore.parentCategories"
            :key="category.id"
            class="border border-gray-300 rounded-sm flex flex-col justify-center items-center text-center cursor-pointer shadow overflow-hidden">
            <div
              @click="fetchSubcategoriesAndProducts(category)"
              class="py-3 px-2 text-base hover:bg-blue-100 w-full h-full flex items-center justify-center animate line-clamp-1">
              {{ category.name }}
            </div>
          </div>
        </div>

        <!-- Products Table -->
        <div
          v-if="products.length"
          class="mt-6 grid grid-cols-5 gap-2 pb-8">
          <div
            v-for="product in products"
            :key="product.id"
            class="border border-gray-200 rounded-sm flex flex-col justify-center items-center text-center shadow-lg cursor-pointer overflow-hidden py-2 px-2 2xl:px-2 hover:bg-green-400 w-full animate group text-black"
            @click="() => addToCart(product)">
            <h3 class="text-sm font-medium line-clamp-3">
              {{ product.name }}
            </h3>
            <p
              class="text-sm text-green-500 font-bold mt-1 group-hover:text-black">
              ${{ product.selling_price }}
            </p>
          </div>
        </div>

        <div
          v-if="cart.length"
          class="mt-6">
          <h3 class="font-semibold mb-2">Selected Items</h3>
          <ul class="space-y-2">
            <li
              v-for="(item, index) in cart"
              :key="item.id"
              class="flex flex-col border p-2 rounded">
              <div class="flex justify-between items-center">
                <span
                  >{{ index + 1 }}. {{ item.name }} x{{ item.quantity }}</span
                >
                <button
                  @click="removeFromCart(index)"
                  class="text-red-500 text-sm hover:underline">
                  Remove
                </button>
              </div>
              <div class="flex items-center gap-4 mt-1">
                <label class="text-sm">Discount:</label>
                <input
                  type="number"
                  v-model.number="cart[index].discount"
                  class="input-field w-24"
                  min="0"
                  placeholder="0.00" />
                <span class="text-sm">
                  Line Total: ${{
                    (
                      item.selling_price * item.quantity -
                      item.discount
                    ).toFixed(2)
                  }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
