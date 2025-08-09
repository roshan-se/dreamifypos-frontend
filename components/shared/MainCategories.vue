<script setup>
import { ref } from "vue";
import ProductsTable from "../tables/ProductsTable.vue";
import CreateProduct from "./CreateProduct.vue";
import { SquarePen, Trash2 } from "lucide-vue-next";

defineProps({
  categories: Array,
});

const runtimeConfig = useRuntimeConfig();
const baseURL = runtimeConfig.public.apiBase;

const categoryStore = useCategoryStore();

const currentCategory = ref(null);
const childCategories = ref([]);
const products = ref([]);
const categoryHistory = ref([]); // To track breadcrumb navigation

const editProduct = ref(null);

const openModal = ref(false);

const toggleModal = (value) => {
  console.log("Iam tirggered")
  openModal.value = value
  if(value == false) {
    editProduct.value = null
  }
};


const fetchSubcategoriesAndProducts = async (category) => {
  try {
    const response = await $fetch(
      baseURL + `/child-categories/${category.id}`
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

const productCreateSuccess = () => {
  // console.log(currentCategory.id)
  fetchSubcategoriesAndProducts(currentCategory.value);
};

// Set the `editProduct` when the "Edit" button is clicked
const handleEditProduct = (product) => {
  console.log("Helllo")
  editProduct.value = product;
  openModal.value = true
};

</script>

<template>
  <div>
    <h2 class="py-2 px-4 font-semibold mb-6 bg-sky-100 border border-dotted border-sky-300">
      Product Categories
    </h2>
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
            index + 1 == categoryHistory.length
              ? 'text-emerald-600'
              : 'text-gray-700',
          ]"
          >{{ category.name }}</span
        >
      </span>
    </div>

    <!-- Parent/Child Categories Grid -->
    <div
      v-if="childCategories.length || !currentCategory"
      class="grid grid-cols-4 lg:grid-cols-5 2xl:grid-cols-8 gap-6 pb-8">
      <div
        v-for="category in currentCategory ? childCategories : categories"
        :key="category.id"
        class="border border-gray-200 rounded-md flex flex-col justify-center items-center text-center shadow-lg cursor-pointer overflow-hidden">
        <div
          @click="fetchSubcategoriesAndProducts(category)"
          class="py-5 px-6 hover:bg-emerald-100 w-full h-full flex items-center justify-center animate">
          {{ category.name }}
        </div>

        <div
          class="w-full border-t border-gray-100 flex px-2 py-2 justify-between">
          <button
            @click="confirmDelete(category.id)"
            class="font-medium text-red-400 hover:text-red-600 dark:text-red-500 hover:underline cursor-pointer">
            <Trash2 size="20" />
          </button>
          <button
            @click="$emit('editCategory', category)"
            class="font-medium text-blue-400 hover:text-blue-600 animate dark:text-blue-500 hover:underline cursor-pointer">
            <SquarePen size="20" />
          </button>
        </div>
      </div>
    </div>

    <!-- Products Table -->
    <div class="mt-6">
      <div class="flex flex-col gap-6">
        <CreateProduct
          :currentCategory="currentCategory"
          @create-product="productCreateSuccess"
          :editProduct="editProduct"
          :openModal="openModal"
          @close-modal="toggleModal" />

        <div v-if="products.length">
          <ProductsTable :products="products" @edit-product="handleEditProduct" @create-product="productCreateSuccess" />
        </div>
      </div>
    </div>
  </div>
</template>
