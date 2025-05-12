import { defineStore } from "pinia";

export const useVariationStore = defineStore("variation", () => {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = runtimeConfig.public.apiBase;
  const variations = ref([]);

  const fetchVariations = async () => {
    try {
      const response = await $fetch(baseURL + "/variations");
      console.log(response);

      variations.value = response;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };


  const addVariation = async (variationData) => {
    try {
      const response = await $fetch(baseURL + "/variations", {
        method: "POST",
        body: variationData,
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const deleteVariation = async (variationId) => {
    try {
      const response = await $fetch(baseURL + "/variations/" + variationId, {
        method: "DELETE",
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const updateVariation = async (variationId, updatedData) => {
    try {
      const response = await $fetch(`${baseURL}/variations/${variationId}`, {
        method: "PATCH", // Use "PUT" if replacing the entire resource
        body: updatedData,
      });
  
      return response;
    } catch (err) {
      console.error("Error updating category:", err);
  
      if (err.response && err.response._data) {
        return err.response._data;
      }
  
      return { error: "An unexpected error occurred. Please try again." };
    }
  };

  return {
    variations,
    fetchVariations,
    addVariation,
    updateVariation,
    deleteVariation,
  };
});
