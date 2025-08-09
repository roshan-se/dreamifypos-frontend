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
import { SquarePen, Trash } from "lucide-vue-next";

const repairStore = useRepairStore();

onMounted(() => {
  repairStore.fetchRepairs();

  console.log("Checking Repairs", repairStore.repairs);
});

const confirmDelete = async (value) => {
  if (confirm("Are you sure you want to delete this repair?")) {
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
          <TableCell class="font-medium"> {{ repair.job_number }} </TableCell>
          <TableCell>{{ repair.customer.name }}</TableCell>
          <TableCell>{{ repair.device_model }}</TableCell>
          <TableCell>
            <span
              :class="{
                'bg-amber-400': repair.status === 'pending',
                'bg-blue-400': repair.status === 'waiting',
                'bg-teal-400': repair.status === 'arrived',
                'bg-emerald-400': repair.status === 'completed',
                'bg-rose-400': repair.status === 'cancelled',
              }"
              class="px-3 py-1 rounded-full text-xs uppercase font-semibold">
              {{ repair.status }}
            </span>
          </TableCell>
          <TableCell
            ><span
              :class="{
                'bg-amber-400': repair.payment_status === 'pending_payment',
                'bg-indigo-400': repair.payment_status === 'deposit_paid',
                'bg-emerald-400': repair.payment_status === 'paid',
                'bg-rose-400': repair.payment_status === 'failed',
                'bg-purple-400': repair.payment_status === 'refunded',
              }"
              class="px-3 py-1 rounded-full text-xs uppercase font-semibold">
              {{ repair.payment_status }}</span
            ></TableCell
          >
          <TableCell
            ><div class="flex items-center gap-4">
              <NuxtLink
                :to="'/repairs/' + repair.id"
                class="text-sky-600 hover:text-sky-800">
                <SquarePen size="20" />
              </NuxtLink>
              <button
                @click="confirmDelete(repair.id)"
                class="text-red-500 hover:text-red-600">
                <Trash size="20" />
              </button></div
          ></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
