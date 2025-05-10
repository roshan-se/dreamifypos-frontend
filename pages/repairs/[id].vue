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
      <!-- Left Panel: Form -->
      <div class="col-span-5 space-y-4">
        <!-- Customer Search -->
        <div>
          <input
            v-model="searchQuery"
            type="text"
            class="input-field w-full"
            placeholder="Search Customer..." />
          <ul
            v-if="filteredCustomers.length"
            class="border mt-1 bg-white">
            <li
              v-for="c in filteredCustomers"
              :key="c.id"
              @click="selectCustomer(c)"
              class="p-2 hover:bg-gray-100 cursor-pointer">
              {{ c.name }} • {{ c.phone }}
            </li>
          </ul>
        </div>
        <button
          v-if="repairFormData.customer_id"
          @click="clearCustomer"
          class="text-sm text-blue-600 underline">
          Change Customer
        </button>

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
          @click="handleUpdateRepair"
          class="primary-btn w-full">
          Save Changes
        </button>
        <div
          v-if="errors"
          class="mt-4 text-red-600">
          {{ errors }}
        </div>
      </div>

      <!-- Right Panel: Products & Cart -->
      <div class="col-span-7">
        <h2 class="font-semibold mb-4">Select Repair Items</h2>
        <div class="grid grid-cols-5 gap-2 mb-6">
          <div
            v-for="prod in products"
            :key="prod.id"
            @click="addToCart(prod)"
            class="border p-4 cursor-pointer hover:bg-green-200">
            <div class="truncate">{{ prod.name }}</div>
            <div class="font-bold mt-1">${{ prod.selling_price }}</div>
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

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const id = route.params.id;

const productStore = useProductStore();
const customerStore = useCustomerStore();
const repairStore = useRepairStore();
const employeeStore = useEmployeeStore();

const errors = ref("");
const cart = ref([]);
const searchQuery = ref("");

const products = computed(() => productStore.products || []);
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return [];
  return customerStore.customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

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

function selectCustomer(c) {
  repairFormData.customer_id = c.id;
  searchQuery.value = c.name;
}
function clearCustomer() {
  repairFormData.customer_id = null;
  searchQuery.value = "";
}
function addToCart(p) {
  const existing = cart.value.find((i) => i.id === p.id);
  if (existing) existing.quantity++;
  else cart.value.push({ ...p, quantity: 1, discount: 0 });
}
function removeFromCart(i) {
  cart.value.splice(i, 1);
}

async function handleUpdateRepair() {
  errors.value = "";
  if (!repairFormData.customer_id) {
    errors.value = "Please select a customer.";
    useToastify(errors.value, {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "success",
    });
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
    useToastify(errors.value, {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "success",
    });
  } else {
    useToastify("Repair updated successfully!", {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "success",
    });
    router.push("/repairs");
  }
}

async function loadData() {
  await Promise.all([
    customerStore.fetchCustomers(),
    productStore.fetchProducts(),
    employeeStore.fetchEmployees(),
  ]);
  const response = await repairStore.fetchRepair(id);
  console.log("checking ", response);
  const r = response.data || response.data?.data;
  repairFormData.customer_id = r.customer_id;
  searchQuery.value =
    customerStore.customers.find((c) => c.id === r.customer_id)?.name || "";
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
