<script setup>
import MainCategories from '~/components/shared/MainCategories.vue';

const openModal = ref(false);
const categoryStore = useCategoryStore();
const errors = ref("");
const editingCategory = ref(null); // Track if editing

onMounted(() => {
  categoryStore.fetchParentCategories();
  categoryStore.fetchCategories();
});

const categoryFormData = reactive({
  name: "",
  description: "",
  parent_id: ""
});

const toggleModal = (category = null) => {
  openModal.value = !openModal.value;
  errors.value = "";

  if (category) {
    editingCategory.value = category;
    categoryFormData.name = category.name;
    categoryFormData.description = category.description;
    categoryFormData.parent_id = category.parent_id || "";
  } else {
    editingCategory.value = null;
    categoryFormData.name = "";
    categoryFormData.description = "";
    categoryFormData.parent_id = "";
  }
};

const handleSaveCategory = async () => {
  let res;
  if (editingCategory.value) {
    // Update category
    res = await categoryStore.updateCategory(editingCategory.value.id, categoryFormData);
  } else {
    // Create category
    res = await categoryStore.addCategory(categoryFormData);
  }

  if (res.errors) {
    errors.value = Object.values(res.errors)[0][0];
  } else {
    openModal.value = false;
    categoryFormData.name = "";
    categoryFormData.description = "";
    categoryFormData.parent_id = "";

    useToastify(
      editingCategory.value ? "Category updated successfully!" : "Category added successfully!",
      {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "success",
      }
    );

    categoryStore.fetchParentCategories();
    categoryStore.fetchCategories();
  }
};
</script>

<template>
  <div>
    <div class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-xl font-semibold uppercase">Inventory</h1>
        <button class="primary-btn" @click="toggleModal()">Add Category</button>
      </div>

      <MainCategories :categories="categoryStore.parentCategories" @editCategory="toggleModal" />

      <!-- Edit/Create Modal -->
      <div
        v-if="openModal"
        class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-full max-h-full bg-black/70">
        <div class="relative p-4 w-full max-w-2xl m-auto">
          <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ editingCategory ? 'Edit Category' : 'Add New Category' }}
              </h3>
              <button
                @click="toggleModal"
                type="button"
                class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span class="sr-only">Close modal</span>
              </button>
            </div>
            <div class="p-4 md:p-5">
              <div v-if="errors" class="italic text-sm text-red-600 mb-2">
                {{ errors }}
              </div>
              <form class="space-y-4" @submit.prevent="handleSaveCategory">
                <div class="grid grid-cols-2 gap-4">
                  <div class="col-span-2">
                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category Name</label>
                    <input
                      type="text"
                      v-model="categoryFormData.name"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      required />
                  </div>
                  <div class="col-span-2">
                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Parent Category</label>
                    <select v-model="categoryFormData.parent_id" class="input-field">
                      <option value="">Select category (optional)</option>
                      <option v-for="category in categoryStore.categories" :key="category.id" :value="category.id">
                        {{ category.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-span-2">
                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category Description</label>
                    <textarea
                      v-model="categoryFormData.description"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      rows="4"></textarea>
                  </div>
                </div>

                <button type="submit" class="primary-btn w-full">
                  {{ editingCategory ? 'Update' : 'Create' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
