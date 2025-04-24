<script setup>
const props = defineProps({
  currentCategory: Object,
  editProduct: Object, // New prop for editing
  openRepairModal: Boolean,
});

const emit = defineEmits();

//const openRepairModal = ref(false);
const categoryStore = useCategoryStore();
const productStore = useProductStore();
const supplierStore = useSupplierStore();
const errors = ref("");

const repairFormData = reactive({
  customer_id: "",
  device_model: "",
  imei: "",
  passcode: null,
  description: null,
  status: "pending",
  total_cost: null,
  payment_status: null,
  repair_items: [],
});

// const toggleModal = () => {
//   openRepairModal.value = !openRepairModal.value;
// };

// If there's an editProduct, populate the form with its data
watchEffect(() => {
  if (props.editProduct) {
    repairFormData.name = props.editProduct.name;
    repairFormData.sku = props.editProduct.sku;
    repairFormData.barcode = props.editProduct.barcode;
    repairFormData.category_id = props.editProduct.category_id;
    repairFormData.supplier_id = props.editProduct.supplier_id;
    repairFormData.purchase_price = props.editProduct.purchase_price;
    repairFormData.selling_price = props.editProduct.selling_price;
    repairFormData.stock_quantity = props.editProduct.stock_quantity;
    repairFormData.stock_alert_threshold =
      props.editProduct.stock_alert_threshold;
    repairFormData.status = props.editProduct.status;
  }
});

const handleCreateProduct = async () => {
  //repairFormData.category_id = props.currentCategory.id;
  const res = await productStore.addProduct(repairFormData);

  if (res.errors) {
    console.log("Check", res.message);
    console.log("Checking response in form", Object.values(res.errors)[0][0]);
    errors.value = Object.values(res.errors)[0][0];
  } else {
    //openRepairModal.value = false;
    closeRepairModal();
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
  //repairFormData.category_id = props.currentCategory.id;
  const res = await productStore.updateProduct(
    props.editProduct.id,
    repairFormData
  );

  if (res.errors) {
    console.log("Check", res.message);
    console.log("Checking response in form", Object.values(res.errors)[0][0]);
    errors.value = Object.values(res.errors)[0][0];
  } else {
    //openRepairModal.value = false;
    resetForm();
    useToastify("Product updated successfully!", {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "success",
    });
    closeRepairModal();
    emit("create-product");
  }
};

const resetForm = () => {
  repairFormData.name = "";
  repairFormData.sku = "";
  repairFormData.barcode = "";
  repairFormData.category_id = null;
  repairFormData.supplier_id = null;
  repairFormData.purchase_price = null;
  repairFormData.selling_price = null;
  repairFormData.stock_quantity = null;
  repairFormData.stock_alert_threshold = 5;
  repairFormData.status = "active";
};

const closeRepairModal = () => {
  resetForm();
  emit("close-modal", false);
};

onMounted(() => {
  categoryStore.fetchCategories();
  productStore.fetchProducts();
  supplierStore.fetchSuppliers();
});
</script>

<template>
  <div>
    <!-- Main modal -->
    <div
      v-if="openRepairModal"
      class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center content-center w-full md:inset-0 h-full max-h-full bg-black/70">
      <div class="relative p-4 w-full max-w-6xl m-auto">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          <!-- Modal header -->
          <div
            class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ editProduct ? "Edit Product" : "New Repair Form" }}
            </h3>
            <button
              @click="closeRepairModal"
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
                <div class="grid grid-cols-2 gap-4">
                  <div class="col-span-2">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Customer Name</label
                    >
                    <input
                      type="text"
                      v-model="repairFormData.name"
                      class="input-field"
                      placeholder="Enter product name"
                      required />
                  </div>

                  <div class="col-span-2">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Device Name</label
                    >
                    <input
                      type="text"
                      v-model="repairFormData.device_model"
                      class="input-field"
                      placeholder="Enter barcode (optional)" />
                  </div>

                  <div class="col-span-1">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >IMEI</label
                    >
                    <input
                      type="text"
                      v-model="repairFormData.imei"
                      class="input-field"
                      placeholder="Enter SKU" />
                  </div>

                  <div class="col-span-1">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Passcode</label
                    >
                    <input
                      type="text"
                      v-model="repairFormData.imei"
                      class="input-field"
                      placeholder="Enter SKU" />
                  </div>

                  <div class="col-span-2">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Repair Description</label
                    >

                    <textarea
                      name=""
                      id=""
                      class="input-field"
                      v-model="repairFormData.description"></textarea>
                  </div>

                  <div class="col-span-1">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Status</label
                    >
                    <select
                      v-model="repairFormData.status"
                      class="input-field">
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div class="col-span-1">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Payment Status</label
                    >
                    <select
                      v-model="repairFormData.status"
                      class="input-field">
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>
                <div>
                  <h4 class="text-center text-lg font-semibold">Repair Items</h4>
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
