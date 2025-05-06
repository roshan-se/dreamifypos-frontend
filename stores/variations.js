import { defineStore } from "pinia";

const baseURL = "http://127.0.0.1:8000/api";

export const useVariationStore = defineStore("variation", () => {
  const variations = ref([]);

  const fetchVariations = async () => {
    console.log("reached api call");
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
