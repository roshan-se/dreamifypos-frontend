import { defineStore } from "pinia";

const baseURL = "http://127.0.0.1:8000/api";

export const useSupplierStore = defineStore("supplier", () => {
  const suppliers = ref([]);

  const fetchSuppliers = async () => {
    console.log("reached api call");
    try {
      const response = await $fetch(baseURL + "/suppliers");
      console.log(response);

      suppliers.value = response;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const addSupplier = async (supplierData) => {
    try {
      const response = await $fetch(baseURL + "/suppliers", {
        method: "POST",
        body: supplierData,
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const deleteSupplier = async (supplierId) => {
    try {
      const response = await $fetch(baseURL + "/suppliers/" + supplierId, {
        method: "DELETE",
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  return {
    suppliers,
    fetchSuppliers,
    addSupplier,
    // updateCustomer,
    deleteSupplier,
  };
});
