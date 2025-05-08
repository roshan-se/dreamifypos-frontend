import { defineStore } from "pinia";

const baseURL = "http://127.0.0.1:8000/api";

export const useEmployeeStore = defineStore("employee", () => {
  const employees = ref([]);

  const fetchEmployees = async () => {
    console.log("reached api call");
    try {
      const response = await $fetch(baseURL + "/users");
      console.log(response);

      employees.value = response;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const addEmployee = async(employeeData) => {
    try {
      const response = await $fetch(baseURL + "/users", {
        method: "POST",
        body: employeeData,
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  }

  const deleteEmployee = async (employeeId) => {
    try {
      const response = await $fetch(baseURL + "/users/" + employeeId, {
        method: "DELETE",
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const updateEmployee = async (employeeId, updatedData) => {
    try {
      const response = await $fetch(`${baseURL}/users/${employeeId}`, {
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
    employees,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };
});
