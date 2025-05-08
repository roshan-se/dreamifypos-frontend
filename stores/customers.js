import { defineStore } from "pinia";

const baseURL = "http://127.0.0.1:8000/api";

export const useCustomerStore = defineStore("customer", () => {
  const customers = ref([]);

  const fetchCustomers = async () => {
    console.log("reached api call");
    try {
      const response = await $fetch(baseURL + "/customers");
      console.log(response);

      customers.value = response;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const updateCustomer = async (customerId, updatedData) => {
    try {
      const response = await $fetch(`${baseURL}/customers/${customerId}`, {
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

  const addCustomer = async(customerData) => {
    try {
      const response = await $fetch(baseURL + "/customers", {
        method: "POST",
        body: customerData,
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  }

  const deleteCustomer = async (customerId) => {
    try {
      const response = await $fetch(baseURL + "/customers/" + customerId, {
        method: "DELETE",
      });

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
