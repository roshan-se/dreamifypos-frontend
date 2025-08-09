<script setup>
import { ref, reactive } from "vue";
import BranchTable from "~/components/tables/BranchTable.vue";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const branchStore = useBranchStore();

// modal open state
const openModal = ref(false);
// create vs edit
const isEditMode = ref(false);
// if editing, which branch id
const currentBranchId = ref(null);

// simplified form data
const branchFormData = reactive({
  name: "",
  store_id: "",
  phone: "", // optional but recommended
  is_active: true,
});

// open in "create" mode
const openCreateDialog = () => {
  isEditMode.value = false;
  currentBranchId.value = null;
  Object.assign(branchFormData, {
    name: "",
    store_id: "",
    phone: "",
    is_active: true,
  });
  openModal.value = true;
};

// open in "edit" mode
const handleEditBranch = (branch) => {
  isEditMode.value = true;
  currentBranchId.value = branch.id;
  Object.assign(branchFormData, {
    name: branch.name,
    store_id: branch.store_id,
    phone: branch.phone,
    is_active: branch.is_active,
  });
  openModal.value = true;
};

// create or update on submit
const handleSubmit = async () => {
  const payload = { ...branchFormData };

  let res;
  if (isEditMode.value) {
    res = await branchStore.updateBranch(currentBranchId.value, payload);
  } else {
    res = await branchStore.addBranch(payload);
  }

  if (res.errors) {
    const msg = Object.values(res.errors)[0][0];
    useToastify(msg, { type: "error", position: "top-right", autoClose: 3000 });
  } else {
    useToastify(
      isEditMode.value ? "Branch updated!" : "Branch created!",
      { type: "success", position: "top-right", autoClose: 3000 }
    );
    openModal.value = false;
    branchStore.fetchBranches();
  }
};

onMounted(() => {
  branchStore.fetchBranches();
});

</script>

<template>
  <div class="p-4 border-2 border-dashed rounded-lg mt-14">
    <AlertDialog :open="openModal" @open-change="openModal = $event">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-xl font-semibold uppercase">Shops</h1>
        <AlertDialogTrigger as-child>
          <button @click="openCreateDialog" class="primary-btn">
            Add Branch
          </button>
        </AlertDialogTrigger>
      </div>
      
      <BranchTable @edit-branch="handleEditBranch" />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {{ isEditMode ? "Edit Branch" : "Add New Branch" }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <form @submit.prevent="handleSubmit" class="space-y-4 p-4 md:p-5">
              <div class="grid grid-cols-2 gap-4">
                <!-- Branch Name -->
                <div class="col-span-2">
                  <label class="block mb-2 text-sm font-medium">Branch Name*</label>
                  <input
                    v-model="branchFormData.name"
                    required
                    class="input-field"
                    placeholder="e.g. Downtown Location" />
                </div>
                
                <!-- Store ID -->
                <div>
                  <label class="block mb-2 text-sm font-medium">Store ID*</label>
                  <input
                    v-model="branchFormData.store_id"
                    required
                    class="input-field"
                    placeholder="e.g. STORE-001" />
                </div>
                
                <!-- Phone (Optional) -->
                <div>
                  <label class="block mb-2 text-sm font-medium">Phone</label>
                  <input
                    v-model="branchFormData.phone"
                    class="input-field"
                    placeholder="Optional contact number" />
                </div>
                
                <!-- Active Status -->
                <div class="col-span-2">
                  <label class="block mb-2 text-sm font-medium">Status</label>
                  <select
                    v-model="branchFormData.is_active"
                    class="input-field">
                    <option :value="true">Active</option>
                    <option :value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </form>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="openModal = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="handleSubmit" class="primary-btn">
            {{ isEditMode ? "Update" : "Create" }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>