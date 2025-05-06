import { defineStore } from "pinia";

const baseURL = "http://127.0.0.1:8000/api";

export const useRepairStore = defineStore("repair", () => {
  const repairs = ref([]);

  const fetchRepairs = async () => {
    console.log("reached api call");
    try {
      const response = await $fetch(baseURL + "/repairs");
      console.log(response.data);

      repairs.value = response.data;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };


  const addRepair = async (repairData) => {
    try {
      const response = await $fetch(baseURL + "/repairs", {
        method: "POST",
        body: repairData,
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const deleteRepair = async (repairId) => {
    try {
      const response = await $fetch(baseURL + "/repairs/" + repairId, {
        method: "DELETE",
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const updateRepair = async (repairId, updatedData) => {
    try {
      const response = await $fetch(`${baseURL}/repairs/${repairId}`, {
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
    repairs,
    fetchRepairs,
    addRepair,
    updateRepair,
    deleteRepair,
  };
});
