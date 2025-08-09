<script setup>
import { ref, reactive } from "vue";
import EmployeeTable from "~/components/tables/EmployeeTable.vue";
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
import Button from "~/components/ui/button/Button.vue";

const employeeStore = useEmployeeStore();

// modal open state
const openModal = ref(false);
// create vs edit
const isEditMode = ref(false);
// if editing, which employee id
const currentEmployeeId = ref(null);

// shared form data
const employeeFormData = reactive({
  name: "",
  phone: "",
  email: "",
  role: "",
  pin_code: "",
  password: "",
  password_confirmation: "",
});

// open in “create” mode
const openCreateDialog = () => {
  isEditMode.value = false;
  currentEmployeeId.value = null;
  Object.assign(employeeFormData, {
    name: "",
    phone: "",
    email: "",
    role: "",
    pin_code: "",
    password: "",
    password_confirmation: "",
  });
  openModal.value = true;
};

// open in “edit” mode
const handleEditEmployee = (emp) => {
  isEditMode.value = true;
  currentEmployeeId.value = emp.id;
  Object.assign(employeeFormData, {
    name: emp.name,
    phone: emp.phone,
    email: emp.email,
    role: emp.role,
    pin_code: emp.pin_code,
    // we won’t prefill passwords
    password: "",
    password_confirmation: "",
  });
  openModal.value = true;
};

// create or update on submit
const handleSubmit = async () => {
  if (employeeFormData.password !== employeeFormData.password_confirmation) {
    useToastify("Passwords don't match!", {
      autoClose: 3000,
      position: ToastifyOption.POSITION.TOP_RIGHT,
      type: "error",
    });
    return;
  }

  // 2️⃣ Build a shallow copy of the form data
  const payload = { ...employeeFormData };

  if (isEditMode.value) {
    // Remove pin_code, password and confirmation entirely
    delete payload.pin_code;
    delete payload.password;
    delete payload.password_confirmation;
  }

  // 3️⃣ Call the correct store action
  let res;
  if (isEditMode.value) {
    res = await employeeStore.updateEmployee(currentEmployeeId.value, payload);
  } else {
    res = await employeeStore.addEmployee(payload);
  }

  // 4️⃣ Handle the response
  if (res.errors) {
    const msg = Object.values(res.errors)[0][0];
    useToastify(msg, { type: "error", position: "top-right", autoClose: 3000 });
  } else {
    useToastify(isEditMode.value ? "Employee updated!" : "Employee created!", {
      type: "success",
      position: "top-right",
      autoClose: 3000,
    });
    openModal.value = false;
    employeeStore.fetchEmployees();
  }
};
</script>

<template>
  <div class="p-4 border-2 border-dashed rounded-lg mt-14">
    <AlertDialog
      :open="openModal"
      @open-change="openModal = $event">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-xl font-semibold uppercase">Employees</h1>
        <!-- Add / Edit trigger -->
        <AlertDialogTrigger asChild>
          <Button
            @click="openCreateDialog"
            class="bg-sky-600 hover:bg-sky-800 cursor-pointer"
            variant="default">
            Add Employee
          </Button>
        </AlertDialogTrigger>
      </div>
      <!-- table emits edit requests -->
      <EmployeeTable @edit-employee="handleEditEmployee" />

      <!-- shared modal content -->
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {{ isEditMode ? "Edit Employee" : "Add New Employee" }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <form
              @submit.prevent="handleSubmit"
              class="space-y-4 p-4 md:p-5">
              <div class="grid grid-cols-2 gap-4">
                <!-- Name -->
                <div class="col-span-2">
                  <label class="block mb-2 text-sm font-medium">Name</label>
                  <input
                    v-model="employeeFormData.name"
                    required
                    class="input-field"
                    autocomplete="off" />
                </div>
                <!-- Pin Code -->
                <div v-if="!isEditMode">
                  <label class="block mb-2 text-sm font-medium">Pin Code</label>
                  <input
                    v-model="employeeFormData.pin_code"
                    required
                    class="input-field"
                    autocomplete="off" />
                </div>
                <!-- Role -->
                <div>
                  <label class="block mb-2 text-sm font-medium">Role</label>
                  <select
                    v-model="employeeFormData.role"
                    required
                    class="input-field">
                    <option
                      disabled
                      value="">
                      Select Role
                    </option>
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                <!-- Phone -->
                <div>
                  <label class="block mb-2 text-sm font-medium">Phone</label>
                  <input
                    v-model="employeeFormData.phone"
                    required
                    class="input-field" />
                </div>
                <!-- Email -->
                <div :class="[isEditMode ? 'col-span-2' : 'col-span-1']">
                  <label class="block mb-2 text-sm font-medium">Email</label>
                  <input
                    v-model="employeeFormData.email"
                    required
                    class="input-field" />
                </div>
                <!-- Password -->
                <div v-if="!isEditMode">
                  <label class="block mb-2 text-sm font-medium">Password</label>
                  <input
                    type="password"
                    v-model="employeeFormData.password"
                    :required="!isEditMode"
                    class="input-field" />
                </div>
                <!-- Confirm Password -->
                <div v-if="!isEditMode">
                  <label class="block mb-2 text-sm font-medium"
                    >Confirm Password</label
                  >
                  <input
                    type="password"
                    v-model="employeeFormData.password_confirmation"
                    :required="!isEditMode"
                    class="input-field" />
                </div>
              </div>
            </form>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            class="bg-red-400 hover:bg-red-600 text-white hover:text-white cursor-pointer"
            @click="openModal = false"
            >Cancel</AlertDialogCancel
          >
          <AlertDialogAction
            @click="handleSubmit"
            class="bg-sky-600 hover:bg-sky-800 cursor-pointer">
            {{ isEditMode ? "Update" : "Create" }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
