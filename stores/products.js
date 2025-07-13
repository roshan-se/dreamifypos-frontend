import { defineStore } from "pinia";
import axios from "axios";

export const useProductStore = defineStore("product", () => {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = runtimeConfig.public.apiBase;
  const products = ref([]);
  const lowStock = ref([]);

  const branchStore = useBranchStore() 

  const fetchLowStockProducts = async (branchId = null) => {
    try {
      const url = branchStore.activeBranch 
        ? `${baseURL}/products/low-stock?branch_id=${branchStore.activeBranch.id}`
        : `${baseURL}/products/low-stock`;
      
      const res = await axios.get(url);
      lowStock.value = res.data.data;
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      throw error;
    }
  };

  const fetchProducts = async (branchId = null) => {
    try {
      const url = branchId 
        ? `${baseURL}/products?branch_id=${branchId}`
        : `${baseURL}/products`;
      
      const response = await axios.get(url);
      products.value = response.data.data || response.data;
    } catch (err) {
      console.error("Error fetching products:", err);
      throw err;
    }
  };

  const addProduct = async (productData) => {
    console.log("cjecking poduct data")
    console.log(productData)
    try {
      const formData = new FormData();
      
      // Product fields
      formData.append("name", productData.name);
      if (productData.sku) formData.append("sku", productData.sku);
      if (productData.barcode) formData.append("barcode", productData.barcode);
      formData.append("category_id", productData.category_id);
      formData.append("quantity", productData.quantity);
      formData.append("purchase_price", String(productData.purchase_price));
      formData.append("selling_price", String(productData.selling_price));
      if (productData.variation_id) formData.append("variation_id", productData.variation_id);
      formData.append("status", productData.status);
      
      // Image handling
      if (productData.image_url instanceof File) {
        formData.append("image_url", productData.image_url);
      }
      
      // Add branch inventory data if present
      if (productData.branches && productData.branches.length) {
        formData.append("branches", JSON.stringify(productData.branches));
      }

      const response = await axios.post(`${baseURL}/products`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Accept": "application/json"
        }
      });

      // Refresh products list after adding
      await fetchProducts();
      return response.data;

    } catch (err) {
      console.error("Error adding product:", err.response || err);
      throw err.response?.data || { error: "Failed to add product" };
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      
      // Product fields
      formData.append("name", productData.name);
      if (productData.sku) formData.append("sku", productData.sku);
      if (productData.barcode) formData.append("barcode", productData.barcode);
      formData.append("category_id", productData.category_id);
      formData.append("purchase_price", String(productData.purchase_price));
      formData.append("selling_price", String(productData.selling_price));
      if (productData.variation_id) formData.append("variation_id", productData.variation_id);
      formData.append("status", productData.status);
      
      // Image handling
      if (productData.image_url instanceof File) {
        formData.append("image_url", productData.image_url);
      } else if (productData.image_url === null) {
        // To handle image removal
        formData.append("remove_image", "true");
      }

      const response = await axios.post(`${baseURL}/products/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Accept": "application/json"
        }
      });

      // Refresh products list after update
      await fetchProducts();
      return response.data;

    } catch (err) {
      console.error("Error updating product:", err.response || err);
      throw err.response?.data || { error: "Failed to update product" };
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const response = await axios.delete(`${baseURL}/products/${productId}`);
      
      // Refresh products list after deletion
      await fetchProducts();
      return response.data;

    } catch (err) {
      console.error("Error deleting product:", err.response || err);
      throw err.response?.data || { error: "Failed to delete product" };
    }
  };

  // New method to update inventory for a product at a branch
  const updateInventory = async (productId, branchId, inventoryData) => {
    try {
      const response = await axios.post(`${baseURL}/products/${productId}/inventory`, {
        branch_id: branchId,
        quantity: inventoryData.quantity,
        stock_alert_threshold: inventoryData.stock_alert_threshold
      });

      // Refresh products list after inventory update
      await fetchProducts();
      return response.data;

    } catch (err) {
      console.error("Error updating inventory:", err.response || err);
      throw err.response?.data || { error: "Failed to update inventory" };
    }
  };

  return {
    products,
    lowStock,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchLowStockProducts,
    updateInventory
  };
});