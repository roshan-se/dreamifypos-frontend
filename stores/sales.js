import { defineStore } from "pinia";

const baseURL = "http://127.0.0.1:8000/api";

export const useSalesStore = defineStore("sales", () => {
  const sales = ref([]);

  const fetchSales = async (startDate, endDate) => {
    console.log("Check", startDate, endDate)
    try {
      const response = await $fetch(`${baseURL}/sales?start_date=${startDate}&end_date=${endDate}`);
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
