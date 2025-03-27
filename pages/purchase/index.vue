<script setup>
import RecentPurchaseTable from "~/components/shared/RecentPurchaseTable.vue"
// State management
const showCreateForm = ref(false);
const purchases = ref([]);
const supplier_id = ref("");
const skuInput = ref("");

const productStore = useProductStore();
const supplierStore = useSupplierStore();
const purchaseStore = usePurchaseStore();

onMounted(() => {
  productStore.fetchProducts();
  supplierStore.fetchSuppliers();
  purchaseStore.fetchPurchases();

  console.log(purchaseStore.purchases)
});

const allProducts = computed(() => productStore.products);

// Toggle Form
const toggleForm = () => {
  showCreateForm.value = !showCreateForm.value;
};

// Function to Fetch Product by SKU and Add to Purchase List
const addProductToPurchase = () => {
  if (!skuInput.value) return;

  const product = allProducts.value.find(
    (p) => p.sku.toUpperCase() === skuInput.value.toUpperCase()
  );

  if (product) {
    // Check if product is already in the purchase list
    const existingProduct = purchases.value.find((p) => p.id === product.id);

    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      purchases.value.push({
        ...product,
        quantity: 1,
      });
    }

    skuInput.value = ""; // Clear input after adding
  } else {
    alert("Product not found!");
  }
};

// Function to Remove Product from Purchase List
const removeProduct = (index) => {
  purchases.value.splice(index, 1);
};

const createPurchase = async () => {
  const res = await purchaseStore.addPurchase({
    supplier_id: supplier_id.value,
    products: purchases.value,
  });

  if (res.errors) {
    console.log("Check", res.message);
    console.log("Checking response in form", Object.values(res.errors)[0][0]);
    errors.value = Object.values(res.errors)[0][0];
  } else {
    toggleForm();
    supplier_id.value = "";
    purchases.value = [];

    useToastify("Pruchase created successfully!", {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "success",
    });
  }
};
</script>

<template>
  <div
    class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-semibold uppercase">Purchase</h1>

      <button
        @click="toggleForm"
        :class="[ showCreateForm ? 'danger-btn ' : 'primary-btn'] ">
        {{ showCreateForm ? 'Cancel' : 'Create'}}
      </button>
    </div>

    <div>
      <!-- Form Section -->
      <div
        v-if="showCreateForm"
        class="pt-8 border-t border-gray-300">
        <h2 class="text-lg font-semibold mb-4">New Store Purchase</h2>
        <div class="max-w-max mb-6 flex items-center gap-6">
          <label class="block text-sm font-medium text-gray-900 dark:text-white"
            >Supplier</label
          >
          <select
            v-model="supplier_id"
            class="input-field">
            <option value="">Select supplier</option>
            <option
              v-for="supplier in supplierStore.suppliers"
              :key="supplier.id"
              :value="supplier.id">
              {{ supplier.name }}
            </option>
          </select>
        </div>

        <!-- SKU Input -->
        <div class="mb-4">
          <input
            v-model="skuInput"
            @keyup.enter="addProductToPurchase"
            type="text"
            class="border rounded p-2 w-full"
            placeholder="Enter SKU and press Enter" />
        </div>

        <!-- Purchase Table -->
        <table class="w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 px-4 py-2">Product Name</th>
              <th class="border border-gray-300 px-4 py-2">SKU</th>
              <th class="border border-gray-300 px-4 py-2">Price</th>
              <th class="border border-gray-300 px-4 py-2">Quantity</th>
              <th class="border border-gray-300 px-4 py-2">Total</th>
              <th class="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in purchases"
              :key="item.id">
              <td class="border border-gray-300 px-4 py-2">{{ item.name }}</td>
              <td class="border border-gray-300 px-4 py-2">{{ item.sku }}</td>
              <td class="border border-gray-300 px-4 py-2">
                ${{ item.selling_price }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <input
                  type="number"
                  v-model="item.quantity"
                  min="1"
                  class="border rounded p-1 w-16" />
              </td>
              <td class="border border-gray-300 px-4 py-2">
                ${{ (item.selling_price * item.quantity).toFixed(2) }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <button
                  @click="removeProduct(index)"
                  class="bg-red-500 text-white px-2 py-1 rounded">
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Submit Button -->
        <div class="mt-4">
          <button
            class="primary-btn"
            @click="createPurchase" :disabled="purchases.length < 1">
            Submit Purchase
          </button>
        </div>
      </div>
    </div>

    <!-- Table of recent purchases -->
     <div v-if="!showCreateForm">
        <RecentPurchaseTable />
     </div>
    
  </div>
</template>
