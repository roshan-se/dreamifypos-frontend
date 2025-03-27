<script setup>
import SuppliersTable from "~/components/shared/SuppliersTable.vue";

const openModal = ref(false);
const supplierStore = useSupplierStore();
const errors = ref("");

const supplierFormData = reactive({
  name: "",
  contact_person: "",
  phone: "",
  email: "",
  address: "",
});

const toggleModal = () => {
  openModal.value = !openModal.value;
};

const handleCreateSupplier = async () => {
  const res = await supplierStore.addSupplier(supplierFormData);

  if (res.errors) {
    console.log("Check", res.message);
    console.log("Checking response in form", Object.values(res.errors)[0][0]);
    errors.value = Object.values(res.errors)[0][0];
  } else {
    openModal.value = false;
    supplierFormData.name = "";
    supplierFormData.email = "";
    supplierFormData.contact_person = "";
    supplierFormData.phone = "";
    supplierFormData.address = "";
    useToastify("Supplier added successfully!", {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "success",
    });
    supplierStore.fetchSuppliers()
  }
};
</script>

<template>
  <div>
    <div
      class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-xl font-semibold uppercase">Suppliers</h1>

        <button
          class="primary-btn"
          @click="toggleModal">
          Add Supplier
        </button>
      </div>

      <SuppliersTable />

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
                Add New Supplier
              </h3>
              <button
                @click="toggleModal"
                type="button"
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
                @submit.prevent="handleCreateSupplier">
                <div class="grid grid-cols-2 gap-4">
                  <div class="col-span-2">
                    <label
                      for=""
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Supplier Name</label
                    >
                    <input
                      type="text"
                      v-model="supplierFormData.name"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      placeholder="" />
                  </div>
                  <div>
                    <label
                      for=""
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Contact Person</label
                    >
                    <input
                      type="text"
                      v-model="supplierFormData.contact_person"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      placeholder="" />
                  </div>
                  <div>
                    <label
                      for=""
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Phone Number</label
                    >
                    <input
                      type="text"
                      v-model="supplierFormData.phone"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      placeholder="" />
                  </div>
                  <div>
                    <label
                      for=""
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Email</label
                    >
                    <input
                      type="text"
                      v-model="supplierFormData.email"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      placeholder="" />
                  </div>
                  <div>
                    <label
                      for=""
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Address</label
                    >
                    <input
                      type="text"
                      v-model="supplierFormData.address"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      placeholder="" />
                  </div>
                </div>

                <button
                  type="submit"
                  class="primary-btn w-full">
                  Create
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
