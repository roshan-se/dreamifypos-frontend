import { defineStore } from "pinia";

const baseURL = "http://127.0.0.1:8000/api";

export const useProductStore = defineStore("product", () => {
  const products = ref([]);

  const fetchProducts = async () => {
    console.log("reached api call");
    try {
      const response = await $fetch(baseURL + "/products");
      console.log(response);

      products.value = response;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const addProduct = async (productData) => {
    try {
      const response = await $fetch(baseURL + "/products", {
        method: "POST",
        body: productData,
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const deleteProduct = async (categoryId) => {
    try {
      const response = await $fetch(baseURL + "/products/" + categoryId, {
        method: "DELETE",
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  return {
    products,
    fetchProducts,
    addProduct,
    // updateCustomer,
    deleteProduct,
  };
});
