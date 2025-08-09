<script setup>
import { ref, onMounted } from "vue";
import {
  SquarePen, Trash
} from "lucide-vue-next";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const variationStore = useVariationStore();

onMounted(() => {
  variationStore.fetchVariations();
});

const confirmDelete = async (value) => {
  if (confirm("Are you sure you want to delete this supplier?")) {
    const res = await variationStore.deleteVariation(value);

    if (res.errors) {
      let errorMsg = Object.values(res.errors)[0][0];
      useToastify(errorMsg, {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "error",
      });
    } else {
      useToastify("Variation deleted successfully!", {
        autoClose: 3000,
        position: ToastifyOption.POSITION.TOP_RIGHT,
        type: "success",
      });
      await variationStore.fetchVariations();
    }
  }
};
</script>

<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-sm p-2 border">
    <Table>
      <TableCaption>A list of variations.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]"> ID </TableHead>
          <TableHead>Variation Name</TableHead>
          <TableHead>Variation Items</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="variation in variationStore.variations"
          :key="variation.id">
          <TableCell class="font-medium"> {{ variation.id }} </TableCell>
          <TableCell>{{ variation.name }}</TableCell>
          <TableCell>{{ variation.items }}</TableCell>
          <TableCell
            ><div class="flex items-center gap-4">
              <a
                @click="$emit('edit-variation', variation)"
                class="text-sky-600 hover:text-sky-800">
                <SquarePen size="20" />
              </a>
              <button
                @click="confirmDelete(variation.id)"
                class="text-red-500 hover:text-red-600">
                <Trash size="20" />
              </button></div
          ></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
