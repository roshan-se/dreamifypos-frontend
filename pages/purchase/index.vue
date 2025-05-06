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

    <!-- Table of recent purchases -->
    <div v-if="!showCreateForm">
      <RecentPurchaseTable />
    </div>
  </div>
</template>

<script setup>
import RecentPurchaseTable from "~/components/shared/RecentPurchaseTable.vue";
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
