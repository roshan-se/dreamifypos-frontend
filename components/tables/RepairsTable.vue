<script setup>
import { ref, onMounted } from "vue";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const repairStore = useRepairStore();

onMounted(() => {
  repairStore.fetchRepairs();

  console.log("Checking Repairs", repairStore.repairs);
});

const confirmDelete = async (value) => {
  if (confirm("Are you sure you want to delete this supplier?")) {
    const res = await repairStore.deleteRepair(value);

    if (res.errors) {
      let errorMsg = Object.values(res.errors)[0][0];
      useToastify(errorMsg, {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "error",
      });
    } else {
      useToastify("Repair job has been deleted successfully!", {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "success",
      });
      await repairStore.fetchRepairs();
    }
  }
};
</script>

<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-sm p-2 border">
    <Table>
      <TableCaption>A list of repairs.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]"> Repair ID </TableHead>
          <TableHead>Customer Name</TableHead>
          <TableHead>Device Model</TableHead>
          <TableHead>Repair Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="repair in repairStore.repairs"
          :key="repair.id">
          <TableCell class="font-medium"> {{ repair.id }} </TableCell>
          <TableCell>{{ repair.customer.name }}</TableCell>
          <TableCell>{{ repair.device_model }}</TableCell>
          <TableCell>
            <span
              :class="
                repair.status == 'pending'
                  ? 'bg-orange-400'
                  : repair.status == 'completed'
                  ? 'bg-green-400'
                  : 'bg-red-400'
              " class="px-3 py-1 rounded-full text-xs uppercase font-semibold ">
              {{ repair.status }}</span
            >
          </TableCell>
          <TableCell><span
              :class="
                repair.status == 'pending'
                  ? 'bg-blue-400'
                  : repair.status == 'completed'
                  ? 'bg-green-400'
                  : 'bg-red-400'
              " class="px-3 py-1 rounded-full text-xs uppercase font-semibold ">
              {{ repair.status }}</span
            ></TableCell>
          <TableCell
            ><div class="flex items-center gap-4">
              <a
                href="#"
                class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </a>
              <button
                @click="confirmDelete(repair.id)"
                class="font-medium text-red-600 dark:text-red-500 hover:underline">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button></div
          ></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
