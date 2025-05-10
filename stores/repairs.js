import { defineStore } from "pinia";

const baseURL = "http://127.0.0.1:8000/api";
const token =
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

export const useRepairStore = defineStore("repair", () => {
  const repairs = ref([]);

  const repair = ref(null);

  const fetchRepairs = async () => {
    console.log("reached api call");
    try {
      const response = await $fetch(baseURL + "/repairs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);

      repairs.value = response.data;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const fetchRepair = async (repairId) => {
    console.log("reached api call");
    try {
      // call the show endpoint
      const response = await $fetch(`${baseURL}/repairs/${repairId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response:", response);

      // depending on your API shape, this might be response.data or response.data.data
      // with the controller above it's: { success: true, data: { ... } }
      repair.value = response.data ?? response.data?.data;

      return response;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const addRepair = async (repairData) => {
    try {
      const response = await $fetch(baseURL + "/repairs", {
        method: "POST",
        body: repairData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    repair,
    fetchRepairs,
    fetchRepair,
    addRepair,
    updateRepair,
    deleteRepair,
  };
});
