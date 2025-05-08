<script setup>
import { ref } from "vue";
import ProductsTable from "./ProductsTable.vue";

// pull in Nuxt’s runtime config
const config = useRuntimeConfig()

// now you can reference your .env var
const imageBase = config.public.imageBase


console.log("api url", config.public)
const categoryStore = useCategoryStore();

onMounted(() => {
  categoryStore.fetchParentCategories();
  categoryStore.fetchCategories();
});

const currentCategory = ref(null);
const childCategories = ref([]);
const products = ref([]);
const categoryHistory = ref([]); // To track breadcrumb navigation

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
  <div>
    <h2 class="text-2xl font-bold mb-4">Product Inventory</h2>
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
        :key="category.id" class="text-lg font-semibold">
        <span v-if="index > 0"> / </span>
        <span class=" px-2" :class="[index + 1 == categoryHistory.length ? 'text-green-600' : '']">{{ category.name }}</span>
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
        class="border border-gray-200 rounded-sm flex flex-col justify-center items-center text-center shadow-lg cursor-pointer overflow-hidden">
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
      class="mt-6 grid grid-cols-5 2xl:grid-cols-6 gap-2 pb-8">
      <div
        v-for="product in products"
        :key="product.id"
        class="border border-gray-200 rounded-sm flex flex-col justify-center items-center text-center shadow-lg cursor-pointer overflow-hidden py-2 px-2 2xl:px-2 hover:bg-green-400 w-full animate group text-black"
        @click="$emit('addToCart', product)">
        <img :src="imageBase + '/' + product.image_url" alt="">
        <h3 class="text-sm font-medium line-clamp-3">
          {{ product.name }}
        </h3>
        <p class="text-sm text-green-500 font-bold mt-1 group-hover:text-black">${{ product.selling_price }}</p>
      </div>
    </div>
  </div>
</template>
