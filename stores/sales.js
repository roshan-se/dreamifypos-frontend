import { defineStore } from "pinia";

export const useSalesStore = defineStore("sales", () => {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = runtimeConfig.public.apiBase;
  const sales = ref([]);

  const branchStore = useBranchStore()

  const fetchSales = async (startDate, endDate) => {
    console.log("Check", startDate, endDate)
    try {
      const response = await $fetch(`${baseURL}/sales?start_date=${startDate}&end_date=${endDate}&branch_id=${branchStore.activeBranch.id}`);
      sales.value = response

    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

//   const addSupplier = async (supplierData) => {
//     try {
//       const response = await $fetch(baseURL + "/suppliers", {
//         method: "POST",
//         body: supplierData,
//       });

//       return response;
//     } catch (err) {
//       console.error("Unexpected error:", err.response);
//       return err.response._data;
//     }
//   };

//   const deleteSupplier = async (supplierId) => {
//     try {
//       const response = await $fetch(baseURL + "/suppliers/" + supplierId, {
//         method: "DELETE",
//       });

//       return response;
//     } catch (err) {
//       console.error("Unexpected error:", err.response);
//       return err.response._data;
//     }
//   };

  return {
    sales,
    fetchSales,
    //addSupplier,
    // updateCustomer,
    //deleteSupplier,
  };
});
