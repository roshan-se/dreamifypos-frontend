<script setup>
import { reactive, ref, onBeforeUnmount, computed } from "vue";
import { useBranchStore } from "../stores/branches";

const branchStore = useBranchStore();
const config = useRuntimeConfig();
const imageBase = config.public.imageBase;

const props = defineProps({
  currentCategory: Object,
  editProduct: Object,
  openModal: Boolean,
});

const emit = defineEmits();

const categoryStore = useCategoryStore();
const productStore = useProductStore();
const variationStore = useVariationStore();
const errors = ref("");

// Simplified product form - no inventory fields
const productFormData = reactive({
  name: "",
  sku: "",
  barcode: "",
  category_id: null,
  purchase_price: null,
  selling_price: null,
  variation_id: null,
  status: "active",
  image_url: null
});

// Branch inventory data for new products
const initialInventory = reactive({
  branch_id: null,
  quantity: 0,
});

const prepareProductData = () => {
  return {
    ...productFormData,
    quantity: initialInventory.quantity,
    branches:
      initialInventory.branch_id === "all"
        ? branchStore.branches.map((branch) => ({
            branch_id: branch.id,
            quantity: initialInventory.quantity,
          }))
        : [
            {
              branch_id: initialInventory.branch_id,
              quantity: initialInventory.quantity,
            },
          ],
  };
};

const imagePreview = ref(null);

// when file input changes
function onFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    productFormData.image_url = null;
    imagePreview.value = null;
    return;
  }
  productFormData.image_url = file;
  imagePreview.value = URL.createObjectURL(file);
}

onBeforeUnmount(() => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
});

watchEffect(() => {
  if (props.editProduct) {
    productFormData.name = props.editProduct.name;
    productFormData.sku = props.editProduct.sku;
    productFormData.barcode = props.editProduct.barcode;
    productFormData.category_id = props.editProduct.category_id;
    productFormData.purchase_price = props.editProduct.purchase_price;
    productFormData.selling_price = props.editProduct.selling_price;
    productFormData.status = props.editProduct.status;
    productFormData.image_url = props.editProduct.image_url;
    productFormData.variation_id = props.editProduct.variation_id;
  }
});

const handleCreateProduct = async () => {
  productFormData.category_id = props.currentCategory.id;

  // For new products, combine product data with initial inventory
  const productData = prepareProductData();

  try {
    const res = await productStore.addProduct(productData);

    if (res.errors) {
      errors.value = Object.values(res.errors)[0][0];
    } else {
      closeModal();
      resetForm();
      useToastify("Product added successfully!", {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "success",
      });
      emit("create-product");
    }
  } catch (error) {
    console.log("New Error", error);
  }
};

const handleUpdateProduct = async () => {
  productFormData.category_id = props.currentCategory.id;
  const res = await productStore.updateProduct(
    props.editProduct.id,
    productFormData
  );

  if (res.errors) {
    errors.value = Object.values(res.errors)[0][0];
  } else {
    resetForm();
    useToastify("Product updated successfully!", {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "success",
    });
    closeModal();
    emit("create-product");
  }
};

const resetForm = () => {
  productFormData.name = "";
  productFormData.sku = "";
  productFormData.barcode = "";
  productFormData.category_id = null;
  productFormData.variation_id = null;
  productFormData.purchase_price = null;
  productFormData.selling_price = null;
  productFormData.status = "active";
  productFormData.image_url = null;

  // Reset inventory fields
  initialInventory.branch_id = null;
  initialInventory.quantity = 0;
};

const closeModal = () => {
  resetForm();
  emit("close-modal", false);
};

onMounted(async () => {
  await categoryStore.fetchCategories();
  await variationStore.fetchVariations();
  await branchStore.fetchBranches();

  // Set default branch if available
  if (branchStore.branches.length > 0 && !initialInventory.branch_id) {
    initialInventory.branch_id = branchStore.branches[0].id;
  }
});
</script>

<template>
  <div v-if="currentCategory">
    <button
      @click="$emit('close-modal', true)"
      class="px-8 py-2 rounded-md bg-blue-600 text-white">
      {{ editProduct ? "Edit Product" : "Add Product" }}
    </button>

    <!-- Main modal -->
    <div
      v-if="openModal"
      class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center content-center w-full md:inset-0 h-full max-h-full bg-black/70">
      <div class="relative p-4 w-full max-w-2xl m-auto">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          <!-- Modal header -->
          <div
            class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ editProduct ? "Edit Product" : "Add New Product" }}
            </h3>
            <button
              @click="closeModal"
              class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-hide="authentication-modal">
              <svg
                class="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14">
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <!-- Modal body -->
          <div class="p-4 md:p-5">
            <div
              v-if="errors"
              class="italic text-sm text-red-600 mb-2">
              {{ errors }}
            </div>
            <form
              class="space-y-4"
              @submit.prevent="
                editProduct ? handleUpdateProduct() : handleCreateProduct()
              ">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    @change="onFileChange"
                    class="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 py-2 px-4" />
                  <img
                    v-if="imagePreview || editProduct"
                    :src="
                      editProduct
                        ? imageBase + productFormData.image_url
                        : imagePreview
                    "
                    alt="Image preview"
                    class="mt-2 h-20 w-20 object-cover rounded" />
                </div>

                <div class="col-span-2">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Product Name
                  </label>
                  <div
                    v-if="!editProduct"
                    class="flex items-center gap-2 rounded-lg border pl-2 bg-gray-800 overflow-hidden">
                    <div class="text-sm text-white">
                      {{ currentCategory.name }}
                    </div>
                    <input
                      type="text"
                      v-model="productFormData.name"
                      class="input-field flex-1 !rounded-l-none !rounded-none !border-0 !border-l focus:outline-none"
                      placeholder="Enter product name"
                      required />
                  </div>

                  <input
                    v-if="editProduct"
                    type="text"
                    v-model="productFormData.name"
                    class="input-field"
                    placeholder="Enter product name"
                    required />
                </div>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    SKU
                  </label>
                  <input
                    type="text"
                    v-model="productFormData.sku"
                    class="input-field"
                    placeholder="Enter SKU" />
                </div>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Barcode
                  </label>
                  <input
                    type="text"
                    v-model="productFormData.barcode"
                    class="input-field"
                    placeholder="Enter barcode (optional)" />
                </div>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Category
                  </label>
                  <div class="input-field !bg-blue-100">
                    {{ currentCategory.name }}
                  </div>
                </div>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    v-model="productFormData.purchase_price"
                    class="input-field"
                    placeholder="Enter purchase price"
                    required />
                </div>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Selling Price
                  </label>
                  <input
                    type="number"
                    v-model="productFormData.selling_price"
                    class="input-field"
                    placeholder="Enter selling price"
                    required />
                </div>

                <!-- Initial Inventory Setup (only for new products) -->
                <template v-if="!editProduct">
                  <div class="col-span-1">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Initial Branch
                    </label>
                    <select
                      v-model="initialInventory.branch_id"
                      class="input-field"
                      required>
                      <option value="">Select Branch</option>
                      <option value="all">All</option>
                      <option
                        v-for="branch in branchStore.branches"
                        :key="branch.id"
                        :value="branch.id">
                        {{ branch.name }}
                      </option>
                    </select>
                  </div>

                  <div class="col-span-1">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Initial Quantity
                    </label>
                    <input
                      type="number"
                      v-model="initialInventory.quantity"
                      class="input-field"
                      placeholder="Enter quantity"
                      min="0"
                      required />
                  </div>
                </template>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Variation
                  </label>
                  <select
                    v-model="productFormData.variation_id"
                    class="input-field">
                    <option value="">Select variation (optional)</option>
                    <option
                      v-for="variation in variationStore.variations"
                      :key="variation.id"
                      :value="variation.id">
                      {{ variation.name }}
                    </option>
                  </select>
                </div>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Status
                  </label>
                  <select
                    v-model="productFormData.status"
                    class="input-field">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                class="primary-btn w-full">
                {{ editProduct ? "Update" : "Create" }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
