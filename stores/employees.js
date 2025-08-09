import { defineStore } from "pinia";
import api from "~/lib/api";

export const useEmployeeStore = defineStore("employee", () => {
  const employees = ref([]);
  const authUser = ref(null);

  // Fetch authenticated user
  const fetchAuthUser = async () => {
    const token = localStorage.getItem("token") || "";
    try {
      const response = await api.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      authUser.value = response.data;
      return response;
    } catch (err) {
      console.error("Error fetching authenticated user:", err);
      authUser.value = null;
      throw err; // Re-throw the error if you want components to handle it
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/users");
      employees.value = response.data;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const addEmployee = async (employeeData) => {
    try {
      const response = await api.post("/users", employeeData);
      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      const response = await api.delete("/users/" + employeeId);
      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const updateEmployee = async (employeeId, updatedData) => {
    try {
      const response = await api.patch(`/users/${employeeId}`, updatedData);
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
    employees,
    authUser,
    fetchAuthUser,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };
});
