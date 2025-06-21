<template>
  <div
    class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-semibold uppercase">Purchase</h1>

      <NuxtLink
        to="/purchase/create"
        class="primary-btn">
        Create
      </NuxtLink>
    </div>

    <ul
      class="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 mb-6">
      <li class="me-2">
        <button
          @click="toggleTab('low-stock')"
          :class="[
            'inline-block p-4 rounded-t-lg cursor-pointer animate',
            activeTab == 'low-stock'
              ? 'text-blue-600 bg-gray-100'
              : 'hover:text-gray-600 hover:bg-gray-50',
          ]">
          Low Stock
        </button>
      </li>
      <li class="me-2">
        <button
          @click="toggleTab('new-purchase')"
          :class="[
            'inline-block p-4 rounded-t-lg cursor-pointer animate',
            activeTab == 'new-purchase'
              ? 'text-blue-600 bg-gray-100'
              : 'hover:text-gray-600 hover:bg-gray-50',
          ]">
          New Purchase
        </button>
      </li>
      <li class="me-2">
        <button
          @click="toggleTab('recent-purchase')"
          :class="[
            'inline-block p-4 rounded-t-lg cursor-pointer animate',
            activeTab == 'recent-purchase'
              ? 'text-blue-600 bg-gray-100'
              : 'hover:text-gray-600 hover:bg-gray-50',
          ]">
          Recent Purchase
        </button>
      </li>
    </ul>

    <!-- Table of recent purchases -->
    <div v-if="!showCreateForm">
      <RecentPurchaseTable />
    </div>

    <LowStockTable />

  </div>
</template>

<script setup>
import RecentPurchaseTable from "~/components/dashboard/purchase/RecentPurchaseTable.vue";
import LowStockTable from "~/components/dashboard/purchase/LowStockTable.vue";
// State management

const activeTab = ref("low-stock");
const showCreateForm = ref(false);
const purchases = ref([]);

const skuInput = ref("");

const productStore = useProductStore();

const purchaseStore = usePurchaseStore();

const toggleTab = (tab) => {
  activeTab.value = tab;
};

onMounted(() => {
  productStore.fetchProducts();

  purchaseStore.fetchPurchases();

  console.log(purchaseStore.purchases);
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
    products: purchases.value,
  });

  if (res.errors) {
    console.log("Check", res.message);
    console.log("Checking response in form", Object.values(res.errors)[0][0]);
    errors.value = Object.values(res.errors)[0][0];
  } else {
    toggleForm();
    purchases.value = [];

    useToastify("Pruchase created successfully!", {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "success",
    });
  }
};
</script>
