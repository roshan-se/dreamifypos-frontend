<template>
  <div
    class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-semibold uppercase">New Purchase</h1>
      <NuxtLink
        to="/purchase"
        class="danger-btn"
        >Cancel</NuxtLink
      >
    </div>

    <div class="w-1/3 relative mb-6">
      <input
        v-model="searchInput"
        @focus="showList = true"
        @blur="hideList"
        type="text"
        class="border rounded p-2 w-full"
        placeholder="Type product name or SKU" />

      <ul
        v-if="showList && searchInput.length >= 3 && filteredProducts.length"
        class="absolute z-20 bg-white border rounded w-full max-h-60 overflow-auto mt-1 shadow">
        <li
          v-for="product in filteredProducts"
          :key="product.id"
          @mousedown.prevent="selectProduct(product)"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
          {{ product.name }} ({{ product.sku }})
        </li>
      </ul>
    </div>

    <table class="w-full border-collapse border border-gray-300 mb-4">
      <thead>
        <tr class="bg-gray-200">
          <th class="border px-4 py-2">Name</th>
          <th class="border px-4 py-2">SKU</th>
          <th class="border px-4 py-2">Price</th>
          <th class="border px-4 py-2">Qty</th>
          <th class="border px-4 py-2">Total</th>
          <th class="border px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, i) in purchases"
          :key="item.id">
          <td class="border px-4 py-2">{{ item.name }}</td>
          <td class="border px-4 py-2">{{ item.sku }}</td>
          <td class="border px-4 py-2">${{ item.selling_price }}</td>
          <td class="border px-4 py-2">
            <input
              type="number"
              v-model="item.quantity"
              min="1"
              class="border rounded p-1 w-16" />
          </td>
          <td class="border px-4 py-2">
            ${{ (item.selling_price * item.quantity).toFixed(2) }}
          </td>
          <td class="border px-4 py-2">
            <button
              @click="removeProduct(i)"
              class="bg-red-500 text-white px-2 py-1 rounded">
              Remove
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <button
      class="primary-btn"
      @click="createPurchase"
      :disabled="!purchases.length">
      Create
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// state
const purchases = ref([]);
const searchInput = ref("");
const showList = ref(false);

const productStore = useProductStore();
const purchaseStore = usePurchaseStore();

// fetch everything up front
onMounted(async () => {
  await productStore.fetchProducts();
  console.log("✅ products loaded:", productStore.products);
  await purchaseStore.fetchPurchases();
});

// all products from Pinia
const allProducts = computed(() => productStore.products);

// filter by name or SKU once you have ≥ 3 chars
const filteredProducts = computed(() => {
  const query = searchInput.value.trim().toLowerCase();
  if (query.length < 3) {
    console.log("🔍 too short:", query);
    return [];
  }

  // DEBUG: log each candidate
  const results = allProducts.value.filter((p) => {
    const name = (p.name ?? "").toString().toLowerCase();
    const sku = (p.sku ?? "").toString().toLowerCase();
    const match = name.includes(query) || sku.includes(query);
    
    return match;
  });

  console.log("🎯 matches for", query, results);
  return results;
});

// add or bump
function selectProduct(product) {
  const exists = purchases.value.find((p) => p.id === product.id);
  if (exists) {
    exists.quantity++;
  } else {
    purchases.value.push({ ...product, quantity: 1 });
  }
  searchInput.value = "";
}

// hide after blur (delay so `mousedown` can fire)
function hideList() {
  setTimeout(() => (showList.value = false), 150);
}

function removeProduct(i) {
  purchases.value.splice(i, 1);
}

async function createPurchase() {
  const res = await purchaseStore.addPurchase({ products: purchases.value });
  if (res.errors) {
    console.error(res.errors);
  } else {
    useToastify("Purchase created successfully!", {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "success",
    });
    purchases.value = [];
    router.push("/purchase");
  }
}
</script>
