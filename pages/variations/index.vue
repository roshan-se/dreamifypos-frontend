<script setup>
import { ref, reactive } from "vue";
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

// modal state + mode
const openModal = ref(false);
const isEditMode = ref(false);
const currentVariationId = ref(null);

// shared form data
const variationsFormData = reactive({
  name: "",
  items: [""],
});

// for server errors
const errors = ref("");

// reset to “new”
const resetForm = () => {
  variationsFormData.name = "";
  variationsFormData.items = [""];
  errors.value = "";
  currentVariationId.value = null;
  isEditMode.value = false;
  openModal.value = false;
};

// open Create dialog
const openCreateDialog = () => {
  resetForm();
  openModal.value = true;
};

// open Edit dialog
const handleEditVariation = (variation) => {
  isEditMode.value = true;
  currentVariationId.value = variation.id;
  variationsFormData.name = variation.name;
  // clone items array
  variationsFormData.items = [...variation.items];
  errors.value = "";
  openModal.value = true;
};

// create or update
const handleSubmit = async () => {
  // basic validation
  if (!variationsFormData.name.trim()) {
    errors.value = "Name is required.";
    return;
  }
  if (variationsFormData.items.some((i) => !i.trim())) {
    errors.value = "All items must be non‑empty.";
    return;
  }

  let payload = {
    name: variationsFormData.name,
    items: variationsFormData.items,
  };

  let res;
  if (isEditMode.value) {
    res = await variationStore.updateVariation(
      currentVariationId.value,
      payload
    );
  } else {
    res = await variationStore.addVariation(payload);
  }

  if (res.errors) {
    errors.value = Object.values(res.errors)[0][0];
  } else {
    useToastify(
      isEditMode.value ? "Variation updated!" : "Variation added successfully!",
      {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "success",
      }
    );
    resetForm();
    openModal.value = false;
    variationStore.fetchVariations();
  }
};
</script>

<template>
  <div class="p-4 border-2 border-dashed rounded-lg mt-14">
    <AlertDialog
      :open="openModal"
      @open-change="openModal = $event">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-xl font-semibold uppercase">Variations</h1>
        <AlertDialogTrigger asChild>
          <button
            @click="openCreateDialog"
            class="primary-btn">
            {{ isEditMode ? "Edit Variation" : "Add Variation" }}
          </button>
        </AlertDialogTrigger>
      </div>

      <!-- table will emit edit events -->
      <VariationsTable @edit-variation="handleEditVariation" />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {{ isEditMode ? "Edit Variation" : "New Variation" }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div class="p-4 md:p-5">
              <div
                v-if="errors"
                class="text-red-600 italic mb-2">
                {{ errors }}
              </div>
              <form
                @submit.prevent="handleSubmit"
                class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <!-- Name -->
                  <div class="col-span-2">
                    <label class="block mb-2 text-sm font-medium">Name</label>
                    <input
                      v-model="variationsFormData.name"
                      type="text"
                      class="input-field"
                      placeholder="Variation name" />
                  </div>
                  <!-- Items -->
                  <div class="space-y-2 col-span-2">
                    <label class="block mb-1 text-sm font-medium">Items</label>
                    <div
                      v-for="(item, idx) in variationsFormData.items"
                      :key="idx"
                      class="flex items-center space-x-2">
                      <input
                        v-model="variationsFormData.items[idx]"
                        type="text"
                        class="flex-1 input-field"
                        placeholder="e.g. Black" />
                      <button
                        type="button"
                        @click="variationsFormData.items.splice(idx, 1)"
                        class="text-red-500 hover:text-red-700 text-2xl"
                        aria-label="Remove item">
                        ×
                      </button>
                    </div>
                    <button
                      type="button"
                      @click="variationsFormData.items.push('')"
                      class="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
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
            @click="handleSubmit"
            class="primary-btn">
            {{ isEditMode ? "Update" : "Create" }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
