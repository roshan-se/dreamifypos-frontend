import { defineStore } from "pinia";
import axios from "axios";

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
      // 1️⃣ Build a FormData payload
      const formData = new FormData();
      formData.append("name", productData.name);
      if (productData.sku) formData.append("sku", productData.sku);
      if (productData.barcode) formData.append("barcode", productData.barcode);
      formData.append("category_id", productData.category_id);
      formData.append("purchase_price", String(productData.purchase_price));
      formData.append("selling_price", String(productData.selling_price));
      formData.append("stock_quantity", String(productData.stock_quantity));
      formData.append(
        "stock_alert_threshold",
        String(productData.stock_alert_threshold)
      );
      if (productData.variation_id)
        formData.append("variation_id", productData.variation_id);
      formData.append("status", productData.status);
      // only append the file if it's a real File object
      if (productData.image_url instanceof File) {
        formData.append("image_url", productData.image_url);
      }

      // 2️⃣ Send it without manually setting Content-Type
      const response = await $fetch(baseURL + "/products", {
        method: "POST",
        body: formData,
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      // 1️⃣ Build a FormData payload
      const formData = new FormData();

      formData.append('_method', 'PUT')
      formData.append("name", productData.name);
      if (productData.sku) formData.append("sku", productData.sku);
      if (productData.barcode) formData.append("barcode", productData.barcode);
      formData.append("category_id", productData.category_id);
      formData.append("purchase_price", String(productData.purchase_price));
      formData.append("selling_price", String(productData.selling_price));
      formData.append("stock_quantity", String(productData.stock_quantity));
      formData.append(
        "stock_alert_threshold",
        String(productData.stock_alert_threshold)
      );
      if (productData.variation_id)
        formData.append("variation_id", productData.variation_id);
      formData.append("status", productData.status);
      // only append the file if it's a File object
      if (productData.image_url instanceof File) {
        console.log("Appending file:", productData.image_url);
        console.log(productData.image_url)
        formData.append("image_url", productData.image_url);
      }

      // 2️⃣ Send it as PATCH (Laravel supports multipart PATCH)
      const url = `http://127.0.0.1:8000/api/products/${productId}`
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      })

      return response.data

    } catch (err) {
      console.error('Axios error:', err.response || err)
    return err.response?.data || { error: 'Unknown error' }
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
    updateProduct,
    deleteProduct,
  };
});
