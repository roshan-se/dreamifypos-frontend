<script setup>
import PosView from "~/components/shared/PosView.vue";

const emit = defineEmits();

/***
 * Call Pinia Store
 */
const productStore = useProductStore();
const supplierStore = useSupplierStore();
const categoryStore = useCategoryStore();
const customerStore = useCustomerStore();

const errors = ref("");

const cart = ref([]);

const currentCategory = ref(null);
const childCategories = ref([]);
const products = ref([]);
const categoryHistory = ref([]); // To track breadcrumb navigation

const repairFormData = reactive({
  customer: {
    id: "",
    name: "",
    phone: "",
  },
  device_model: "",
  imei: "",
  passcode: null,
  description: null,
  status: "pending",
  total_cost: null,
  payment_status: null,
  repair_items: [],
});

const searchQuery = ref("");
const selectedCustomer = ref(null);

// Filter customers based on search query
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return [];
  return customerStore.customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const addToCart = (product) => {
  const existingItem = cart.value.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.value.push({ ...product, quantity: 1 });
  }
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
};

const handleCreateProduct = async () => {
  //repairFormData.category_id = props.currentCategory.id;
  const res = await productStore.addProduct(repairFormData);

  if (res.errors) {
    console.log("Check", res.message);
    console.log("Checking response in form", Object.values(res.errors)[0][0]);
    errors.value = Object.values(res.errors)[0][0];
  } else {
    //openRepairModal.value = false;
    closeRepairModal();
    resetForm();
    useToastify("Product added successfully!", {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "success",
    });
    emit("create-product");
  }
};

const handleUpdateProduct = async () => {
  //repairFormData.category_id = props.currentCategory.id;
  const res = await productStore.updateProduct(
    props.editProduct.id,
    repairFormData
  );

  if (res.errors) {
    console.log("Checking response in form", Object.values(res.errors)[0][0]);
    errors.value = Object.values(res.errors)[0][0];
  } else {
    //openRepairModal.value = false;
    resetForm();
    useToastify("Product updated successfully!", {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "success",
    });
    closeRepairModal();
    emit("create-product");
  }
};

const resetForm = () => {
  repairFormData.name = "";
  repairFormData.sku = "";
  repairFormData.barcode = "";
  repairFormData.category_id = null;
  repairFormData.supplier_id = null;
  repairFormData.purchase_price = null;
  repairFormData.selling_price = null;
  repairFormData.stock_quantity = null;
  repairFormData.stock_alert_threshold = 5;
  repairFormData.status = "active";
};

const closeRepairModal = () => {
  resetForm();
  emit("close-modal", false);
};

onMounted(() => {
  categoryStore.fetchCategories();
  productStore.fetchProducts();
  supplierStore.fetchSuppliers();
  categoryStore.fetchParentCategories();
  customerStore.fetchCustomers();
});

// Select a customer
const selectCustomer = (customer) => {
  repairFormData.customer.id = customer.id;
  repairFormData.customer.name = customer.name;
  repairFormData.customer.phone = customer.phone;
  searchQuery.value = ""; // Clear search input
};

// Remove selected customer
const clearCustomer = () => {
  selectedCustomer.value = null;
};

const fetchSubcategoriesAndProducts = async (category) => {
  try {
    const response = await $fetch(
      `http://127.0.0.1:8000/api/child-categories/${category.id}`
    );
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

const confirmDelete = async (value) => {
  if (confirm("Are you sure you want to delete this category?")) {
    const res = await categoryStore.deleteCategory(value);

    if (res.errors) {
      let errorMsg = Object.values(res.errors)[0][0];
      useToastify(errorMsg, {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "error",
      });
    } else {
      useToastify("Category deleted successfully!", {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "success",
      });
      if (!currentCategory.value) {
        await categoryStore.fetchParentCategories();
      } else {
        await fetchSubcategoriesAndProducts(currentCategory.value);
      }
    }
  }
};
</script>

<template>
  <div
    class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-semibold capitalise">New Repair</h1>

      <NuxtLink
        to="/repairs"
        class="danger-btn">
        Cancel
      </NuxtLink>
    </div>
    <div class="grid grid-cols-12 divide-x">
      <div class="col-span-5 pr-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <!-- Search Customer -->
            <div class="flex gap-4">
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
          </div>
          <div class="col-span-1">
            <label
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Customer Name</label
            >

            <input
              type="text"
              v-model="repairFormData.customer.name"
              class="input-field"
              placeholder="Customer Phone"
              disabled />
          </div>
          <div class="col-span-1">
            <label
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Contact Number</label
            >

            <input
              type="text"
              v-model="repairFormData.customer.phone"
              class="input-field"
              placeholder="Customer Phone Number"
              disabled />
          </div>

          <div class="col-span-2">
            <label
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Device Name</label
            >
            <input
              type="text"
              v-model="repairFormData.device_model"
              class="input-field"
              placeholder="Enter barcode (optional)" />
          </div>

          <div class="col-span-1">
            <label
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >IMEI / Serial</label
            >
            <input
              type="text"
              v-model="repairFormData.imei"
              class="input-field"
              placeholder="Enter SKU" />
          </div>

          <div class="col-span-1">
            <label
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Passcode</label
            >
            <input
              type="text"
              v-model="repairFormData.passcode"
              class="input-field"
              placeholder="Enter SKU" />
          </div>

          <div class="col-span-2">
            <label
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Repair Description</label
            >

            <textarea
              name=""
              id=""
              class="input-field"
              v-model="repairFormData.description"></textarea>
          </div>
          <div class="col-span-2">
            <label
              for=""
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Repair Items</label
            >
            <div class="p-4 border-2 rounded-md border-dashed flex flex-col gap-2">
              <div
                v-for="(item, index) in cart"
                :key="index"
                class="flex justify-between items-center border-b">
                <div class="text-sm">{{ index + 1 }}. {{ item.name }}</div>
                <button class="danger-btn !text-xs !py-1 !px-2 !rounded-sm">
                  Remove
                </button>
              </div>
            </div>
          </div>
          <div class="col-span-1">
            <label
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Total Amount</label
            >
            <input
              type="text"
              v-model="repairFormData.imei"
              class="input-field"
              placeholder="Enter SKU" />
          </div>

          <div class="col-span-1">
            <label
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Status</label
            >
            <select
              v-model="repairFormData.status"
              class="input-field">
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div class="col-span-1">
            <label
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Payment Status</label
            >
            <select
              v-model="repairFormData.status"
              class="input-field">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div class="col-span-2">
            <button class="primary-btn w-full">Create Ticket</button>
          </div>
        </div>
      </div>
      <div class="col-span-7 pl-6">
        <div>
          <h2 class="text-base font-medium mb-4">Select Repair Items</h2>
          <!-- Breadcrumb Navigation -->
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
        </div>
      </div>
    </div>
  </div>
</template>
