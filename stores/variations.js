import { defineStore } from "pinia";
import api from "~/lib/api";

export const useVariationStore = defineStore("variation", () => {

  const variations = ref([]);

  const fetchVariations = async () => {
    try {
      const response = await api.get("/variations");
      variations.value = response.data;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const addVariation = async (variationData) => {
    try {
      const response = await api.post("/variations", variationData);

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const deleteVariation = async (variationId) => {
    try {
      const response = await api.delete("/variations/" + variationId);
      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const updateVariation = async (variationId, updatedData) => {
    try {
      const response = await api.patch(
        `/variations/${variationId}`,
        updatedData
      );

      return response;
    } catch (err) {
      console.error("Error updating category:", err);
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
