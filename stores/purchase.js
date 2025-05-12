import { defineStore } from "pinia";

export const usePurchaseStore = defineStore("purchase", () => {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = runtimeConfig.public.apiBase;
  const purchases = ref([]);

  const fetchPurchases = async () => {
    console.log("reached api call");
    try {
      const response = await $fetch(baseURL + "/purchases");
      console.log(response);

      purchases.value = response;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const addPurchase = async (purchaseData) => {
    try {
      const response = await $fetch(baseURL + "/purchases", {
        method: "POST",
        body: JSON.stringify(purchaseData),
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const deletePurchase = async (purchaseId) => {
    try {
      const response = await $fetch(baseURL + "/purchases/" + purchaseId, {
        method: "DELETE",
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  return {
    purchases,
    fetchPurchases,
    addPurchase,
    // updateCustomer,
    deletePurchase,
  };
});
