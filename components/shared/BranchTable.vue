<script setup>
const emit = defineEmits(['edit-branch']);

const branchStore = useBranchStore();

onMounted(() => {
  branchStore.fetchBranches();
  console.log("I reached branches")
  console.log(branchStore.branches)
});

const handleEdit = (branch) => {
  emit('edit-branch', branch);
};
</script>

<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3">Store ID</th>
          <th scope="col" class="px-6 py-3">Branch Name</th>
          <th scope="col" class="px-6 py-3">Phone</th>
          <th scope="col" class="px-6 py-3">Status</th>
          <th scope="col" class="px-6 py-3">Actions</th>
        </tr>
      </thead>
      <tbody v-if="branchStore.branches">
        <tr v-for="branch in branchStore.branches" :key="branch.id" class="bg-white border-b hover:bg-gray-50">
          <td class="px-6 py-4 font-mono font-medium text-gray-900">
            {{ branch.store_id }}
          </td>
          <td class="px-6 py-4 font-medium text-gray-900">{{ branch.name }}</td>
          <td class="px-6 py-4">{{ branch.phone || '-' }}</td>
          <td class="px-6 py-4">
            <span :class="branch.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                  class="text-xs font-medium px-2.5 py-0.5 rounded">
              {{ branch.is_active ? 'Active' : 'Inactive' }}
            </span>
          </td>
          <td class="px-6 py-4">
            <button @click="handleEdit(branch)" class="font-medium text-blue-600 hover:underline mr-3">
              Edit
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>