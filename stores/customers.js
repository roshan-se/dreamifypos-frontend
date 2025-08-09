import { defineStore } from "pinia";
import api from "~/lib/api";

export const useCustomerStore = defineStore("customer", () => {
  
  const customers = ref([]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      customers.value = response.data;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const updateCustomer = async (customerId, updatedData) => {
    try {
      const response = await api.patch(`/customers/${customerId}`, updatedData);
      return response;
    } catch (err) {
      console.error("Error updating category:", err);
  
      if (err.response && err.response._data) {
        return err.response._data;
      }
  
      return { error: "An unexpected error occurred. Please try again." };
    }
  };

  const addCustomer = async(customerData) => {
    try {
      const response = await api.post("/customers", customerData);
      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  }

  const deleteCustomer = async (customerId) => {
    try {
      const response = await api.delete("/customers/" + customerId);
      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  return {
    customers,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  };
});
