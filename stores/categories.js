import { defineStore } from "pinia";

const baseURL = "http://127.0.0.1:8000/api";

export const useCategoryStore = defineStore("category", () => {
  const categories = ref([]);
  const parentCategories = ref([]);

  const fetchCategories = async () => {
    console.log("reached api call");
    try {
      const response = await $fetch(baseURL + "/categories");
      console.log(response);

      categories.value = response;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const fetchParentCategories = async () => {
    console.log("reached api call");
    try {
      const response = await $fetch(baseURL + "/parent-categories");
      console.log(response);

      parentCategories.value = response;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const addCategory = async (categoryData) => {
    try {
      const response = await $fetch(baseURL + "/categories", {
        method: "POST",
        body: categoryData,
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const response = await $fetch(baseURL + "/categories/" + categoryId, {
        method: "DELETE",
      });

      return response;
    } catch (err) {
      console.error("Unexpected error:", err.response);
      return err.response._data;
    }
  };

  const updateCategory = async (categoryId, updatedData) => {
    try {
      const response = await $fetch(`${baseURL}/categories/${categoryId}`, {
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
    categories,
    parentCategories,
    fetchCategories,
    fetchParentCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
});
