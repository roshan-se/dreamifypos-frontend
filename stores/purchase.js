import { defineStore } from "pinia";
import axios from "axios";

export const usePurchaseStore = defineStore("purchase", () => {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = runtimeConfig.public.apiBase;
  const purchases = ref([]);

  const branchStore = useBranchStore();

  const fetchPurchases = async () => {
    console.log("reached api call");
    try {
      // Get the active branch ID from your branch store
      const activeBranchId = branchStore.activeBranch?.id;

      if (!activeBranchId) {
        console.error("No active branch selected");
        return;
      }

      // Fetch purchases for the active branch
      const response = await $fetch(baseURL + "/purchases", {
        params: {
          branch_id: activeBranchId,
        },
      });

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

  const addPurchaseBatch = async (payload) => {
    try {
      const response = await $fetch(baseURL + "/multi-purchases", {
        method: "POST",
        body: {
          products: payload.products,
          branch_id: payload.branch_id,
        },
      });

      return response;
    } catch (error) {
      return {
        error: true,
        message: error.data?.message || "Failed to create purchases",
      };
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
    addPurchaseBatch,
  };
});
