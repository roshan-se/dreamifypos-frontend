<script setup>
import ProductsTable from "~/components/shared/ProductsTable.vue";

const props = defineProps({
  currentCategory: Object,
  editProduct: Object, // New prop for editing
  openModal: Boolean,
});

const emit = defineEmits();

//const openModal = ref(false);
const categoryStore = useCategoryStore();
const productStore = useProductStore();
const supplierStore = useSupplierStore();
const variationStore = useVariationStore();
const errors = ref("");

const productFormData = reactive({
  name: "",
  sku: "",
  barcode: "",
  category_id: null,
  supplier_id: null,
  purchase_price: null,
  selling_price: null,
  stock_quantity: null,
  stock_alert_threshold: 5,
  variation_id: null,
  status: "active",
});

// const toggleModal = () => {
//   openModal.value = !openModal.value;
// };

// If there's an editProduct, populate the form with its data
watchEffect(() => {
  if (props.editProduct) {
    productFormData.name = props.editProduct.name;
    productFormData.sku = props.editProduct.sku;
    productFormData.barcode = props.editProduct.barcode;
    productFormData.category_id = props.editProduct.category_id;
    productFormData.supplier_id = props.editProduct.supplier_id;
    productFormData.purchase_price = props.editProduct.purchase_price;
    productFormData.selling_price = props.editProduct.selling_price;
    productFormData.stock_quantity = props.editProduct.stock_quantity;
    productFormData.stock_alert_threshold =
      props.editProduct.stock_alert_threshold;
    productFormData.status = props.editProduct.status;
  }
});

const handleCreateProduct = async () => {
  productFormData.category_id = props.currentCategory.id;
  productFormData.name =
    props.currentCategory.name + " - " + productFormData.name;
  const res = await productStore.addProduct(productFormData);

  if (res.errors) {
    console.log("Check", res.message);
    console.log("Checking response in form", Object.values(res.errors)[0][0]);
    errors.value = Object.values(res.errors)[0][0];
  } else {
    //openModal.value = false;
    closeModal();
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
  productFormData.category_id = props.currentCategory.id;
  const res = await productStore.updateProduct(
    props.editProduct.id,
    productFormData
  );

  if (res.errors) {
    console.log("Check", res.message);
    console.log("Checking response in form", Object.values(res.errors)[0][0]);
    errors.value = Object.values(res.errors)[0][0];
  } else {
    //openModal.value = false;
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
  productFormData.supplier_id = null;
  productFormData.variation_id = null;
  productFormData.purchase_price = null;
  productFormData.selling_price = null;
  productFormData.stock_quantity = null;
  productFormData.stock_alert_threshold = 5;
  productFormData.status = "active";
};

const closeModal = () => {
  resetForm();
  emit("close-modal", false);
};

onMounted(() => {
  categoryStore.fetchCategories();
  productStore.fetchProducts();
  supplierStore.fetchSuppliers();
  variationStore.fetchVariations();
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
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >Product Name</label
                  >
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
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >SKU</label
                  >
                  <input
                    type="text"
                    v-model="productFormData.sku"
                    class="input-field"
                    placeholder="Enter SKU" />
                </div>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >Barcode</label
                  >
                  <input
                    type="text"
                    v-model="productFormData.barcode"
                    class="input-field"
                    placeholder="Enter barcode (optional)" />
                </div>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >Category</label
                  >
                  <div
                    type="text"
                    class="input-field !bg-blue-100"
                    placeholder="Enter SKU">
                    {{ currentCategory.name }}
                  </div>
                </div>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >Supplier</label
                  >
                  <select
                    v-model="productFormData.supplier_id"
                    class="input-field">
                    <option value="">Select supplier (optional)</option>
                    <option
                      v-for="supplier in supplierStore.suppliers"
                      :key="supplier.id"
                      :value="supplier.id">
                      {{ supplier.name }}
                    </option>
                  </select>
                </div>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >Purchase Price</label
                  >
                  <input
                    type="number"
                    v-model="productFormData.purchase_price"
                    class="input-field"
                    placeholder="Enter purchase price"
                    required />
                </div>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >Selling Price</label
                  >
                  <input
                    type="number"
                    v-model="productFormData.selling_price"
                    class="input-field"
                    placeholder="Enter selling price"
                    required />
                </div>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >Stock Quantity</label
                  >
                  <input
                    type="number"
                    v-model="productFormData.stock_quantity"
                    class="input-field"
                    placeholder="Enter stock quantity"
                    required />
                </div>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >Stock Alert Threshold</label
                  >
                  <input
                    type="number"
                    v-model="productFormData.stock_alert_threshold"
                    class="input-field"
                    placeholder="Default is 5" />
                </div>

                <div class="col-span-1">
                  <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >Variation</label
                  >
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
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >Status</label
                  >
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
