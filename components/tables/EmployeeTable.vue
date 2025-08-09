<script setup>
import { SquarePen, Trash } from "lucide-vue-next";
import { ref, onMounted } from "vue";

const employeeData = useEmployeeStore();

onMounted(() => {
  employeeData.fetchEmployees();
});

const confirmDelete = async (value) => {
  if (confirm("Are you sure you want to delete this employee?")) {
    const res = await employeeData.deleteEmployee(value);

    if (res.errors) {
      let errorMsg = Object.values(res.errors)[0][0];
      useToastify(errorMsg, {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "error",
      });
    } else {
      useToastify("Employee deleted successfully!", {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "success",
      });
      await employeeData.fetchEmloyees();
    }
  }
};
</script>

<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table
      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th
            scope="col"
            class="px-6 py-3">
            Employee ID
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            Employee Name
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            Role
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            Email
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            Phone
          </th>
          <th
            scope="col"
            class="px-6 py-3">
            Action
          </th>
        </tr>
      </thead>
      <tbody v-if="employeeData.employees">
        <template v-for="employee in employeeData.employees">
          <tr
            v-if="employee && employee.role !== 'super_admin'"
            :key="employee.id"
            class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
            <td
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ employee.id }}
            </td>
            <td
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ employee.name }}
            </td>
            <td
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">
              <div
                class="rounded-full bg-gradient-to-r w-max px-2 py-1 text-center text-xs font-medium text-white capitalize"
                :class="[
                  employee.role == 'admin'
                    ? 'bg-rose-600'
                    : 'bg-emerald-600',
                ]">
                {{ employee.role }}
              </div>
            </td>
            <td
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ employee.email }}
            </td>
            <td
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ employee.phone }}
            </td>
            <td class="px-6 py-4 flex items-center gap-2">
              <button
                @click="$emit('edit-employee', employee)"
                class="text-sky-600 hover:text-sky-800">
                <SquarePen size="20" />
              </button>
              <button
                @click="confirmDelete(employee.id)"
                class="text-red-500 hover:text-red-600">
                 <Trash size="20" />
              </button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
