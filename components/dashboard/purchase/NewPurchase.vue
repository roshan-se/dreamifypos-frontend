<script setup>
import { ref, computed, onMounted } from 'vue';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


const productStore = useProductStore();
const purchaseStore = usePurchaseStore();

const search = ref('');
const selectedProducts = ref([]); // Array of { id, name, selling_price, quantity }

onMounted(() => {
  productStore.fetchProducts(); // Assumes productStore has all products loaded
});

const filteredProducts = computed(() => {
  const q = search.value.toLowerCase();
  return productStore.products.filter(
    (p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
  );
});

const addProduct = (product) => {
  const exists = selectedProducts.value.find((p) => p.id === product.id);
  if (!exists) {
    selectedProducts.value.push({ ...product, quantity: 1 });
    search.value = '';
  }
};

const removeProduct = (id) => {
  selectedProducts.value = selectedProducts.value.filter((p) => p.id !== id);
};

const updateQuantity = (id, qty) => {
  const prod = selectedProducts.value.find((p) => p.id === id);
  if (prod) prod.quantity = qty;
};

const createPurchase = async () => {
  const products = selectedProducts.value.map((p) => ({
    id: p.id,
    quantity: p.quantity,
    selling_price: p.selling_price,
  }));

  const res = await purchaseStore.addPurchaseBatch(products);

  if (res.error) {
    useToastify(res.message, { type: 'error' });
  } else {
    useToastify('Purchase created successfully!', { type: 'success' });
    selectedProducts.value = [];
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto mt-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4">Create New Purchase</h2>

    <Input v-model="search" placeholder="Search by product name or SKU..." class="mb-4" />

    <div v-if="search.length > 0 && filteredProducts.length > 0" class="mb-4 border rounded p-3 bg-gray-50 dark:bg-gray-800">
      <ul class="space-y-2">
        <li v-for="product in filteredProducts" :key="product.id" class="flex justify-between items-center">
          <div>
            <strong>{{ product.name }}</strong> — SKU: {{ product.sku }} — ${{ product.selling_price }}
          </div>
          <Button size="sm" @click="addProduct(product)">Add</Button>
        </li>
      </ul>
    </div>

    <div v-if="selectedProducts.length" class="mt-6">
      <h3 class="font-semibold mb-2">Selected Products</h3>
      <table class="w-full text-sm text-left text-gray-700 dark:text-gray-300">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-700 text-xs uppercase">
            <th class="px-4 py-2">Product</th>
            <th class="px-4 py-2">SKU</th>
            <th class="px-4 py-2">Quantity</th>
            <th class="px-4 py-2">Price</th>
            <th class="px-4 py-2">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in selectedProducts"
            :key="item.id"
            class="border-t border-gray-200 dark:border-gray-600">
            <td class="px-4 py-2">{{ item.name }}</td>
            <td class="px-4 py-2">{{ item.sku }}</td>
            <td class="px-4 py-2">
              <Input
                type="number"
                min="1"
                v-model.number="item.quantity"
                @input="updateQuantity(item.id, item.quantity)"
                class="w-20" />
            </td>
            <td class="px-4 py-2">${{ item.selling_price }}</td>
            <td class="px-4 py-2">
              <Button size="sm" variant="destructive" @click="removeProduct(item.id)">Remove</Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-6 text-right">
      <Button
        :disabled="selectedProducts.length === 0"
        @click="createPurchase">
        Submit Purchase
      </Button>
    </div>
  </div>
</template>
