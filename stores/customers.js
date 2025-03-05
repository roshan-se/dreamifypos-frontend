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

  //   async function addCustomer(customerData) {
  //     try {
  //       const { data, error } = await useFetch(
  //         "http://127.0.0.1:8000/api/customers",
  //         {
  //           method: "POST",
  //           body: customerData,
  //         }
  //       );

  //       if (error.value) {
  //         console.error("Error adding customer:", error.value);
  //         return;
  //       }

  //       this.customers.push(data.value);
  //     } catch (err) {
  //       console.error("Unexpected error:", err);
  //     }
  //   }

  //   async function updateCustomer(id, customerData) {
  //     try {
  //       const { data, error } = await useFetch(
  //         `http://127.0.0.1:8000/api/customers/${id}`,
  //         {
  //           method: "PUT",
  //           body: customerData,
  //         }
  //       );

  //       if (error.value) {
  //         console.error("Error updating customer:", error.value);
  //         return;
  //       }

  //       const index = this.customers.findIndex((c) => c.id === id);
  //       if (index !== -1) {
  //         this.customers[index] = data.value;
  //       }
  //     } catch (err) {
  //       console.error("Unexpected error:", err);
  //     }
  //   }

  //   async function deleteCustomer(id) {
  //     try {
  //       const { error } = await useFetch(
  //         `http://127.0.0.1:8000/api/customers/${id}`,
  //         {
  //           method: "DELETE",
  //         }
  //       );

  //       if (error.value) {
  //         console.error("Error deleting customer:", error.value);
  //         return;
  //       }

  //       this.customers = this.customers.filter((c) => c.id !== id);
  //     } catch (err) {
  //       console.error("Unexpected error:", err);
  //     }
  //   }

  return {
    customers,
    fetchCustomers,
    // addCustomer,
    // updateCustomer,
    // deleteCustomer,
  };
});
