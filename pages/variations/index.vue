<script setup>
import SuppliersTable from "~/components/shared/SuppliersTable.vue";
import VariationsTable from "~/components/tables/VariationsTable.vue";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const variationStore = useVariationStore();

const errors = ref("");

const variationsFormData = reactive({
  name: "",
  items: [""],
});

const resetForm = () => {
  (variationsFormData.name = ""), (variationsFormData.items = [""]);
};

const addItem = () => {
  variationsFormData.items.push("");
};

const removeItem = (index) => {
  variationsFormData.items.splice(index, 1);
};

const createVariation = async () => {
  const res = await variationStore.addVariation(variationsFormData);

  if (res.errors) {
    errors.value = Object.values(res.errors)[0][0];
  } else {
    resetForm();
    useToastify("Variation added successfully!", {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "success",
    });
    variationStore.fetchVariations();
  }
};
</script>

<template>
  <div>
    <div
      class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
      <AlertDialog>
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-xl font-semibold uppercase">Variations</h1>

          <AlertDialogTrigger>
            <div class="primary-btn">Add Variation</div>
          </AlertDialogTrigger>
        </div>

        <VariationsTable />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>New Variation</AlertDialogTitle>
            <AlertDialogDescription>
              <div class="p-4 md:p-5">
                <div
                  v-if="errors"
                  class="italic text-sm text-red-600 mb-2">
                  {{ errors }}
                </div>
                <form class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">
                      <label
                        for=""
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Name</label
                      >
                      <input
                        type="text"
                        v-model="variationsFormData.name"
                        class="input-field"
                        placeholder="" />
                    </div>
                    <div class="space-y-2">
                      <label
                        class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                        Items
                      </label>

                      <div
                        v-for="(item, idx) in variationsFormData.items"
                        :key="idx"
                        class="flex items-center space-x-2">
                        <input
                          type="text"
                          v-model="variationsFormData.items[idx]"
                          class="flex-1 input-field"
                          placeholder="e.g. Black" />
                        <button
                          type="button"
                          @click="removeItem(idx)"
                          class="text-red-500 hover:text-red-700 cursor-pointer text-2xl"
                          aria-label="Remove item">
                          ×
                        </button>
                      </div>

                      <!-- Add Item Button -->
                      <button
                        type="button"
                        @click="addItem"
                        class="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none">
                        + Add Item
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel @click="resetForm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              @click="createVariation"
              class="primary-btn"
              >Create</AlertDialogAction
            >
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
</template>
