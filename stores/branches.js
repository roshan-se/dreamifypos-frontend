import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../lib/api'; // Import your configured axios instance

export const useBranchStore = defineStore('branch', () => {
  const branches = ref([]);
  const isLoading = ref(false);
  const activeBranch = ref(localStorage.getItem('activeBranch') ? JSON.parse(localStorage.getItem('activeBranch')) : null);
  const error = ref(null);

  // Fetch all branches from API
  const fetchBranches = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data } = await api.get('/branches');
      branches.value = data.data || data; // Handle both wrapped and direct responses
      // Set initial active branch if none is set
      if (!activeBranch.value && branches.value.length > 0) {
        activeBranch.value = branches.value[0];
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      console.error('Failed to fetch branches:', err);
      throw err; // Re-throw to allow component handling
    } finally {
      isLoading.value = false;
    }
  };

  // Set active branch
  const setActiveBranch = (branch) => {
    activeBranch.value = branch;
    // Optionally persist in localStorage
    localStorage.setItem('activeBranch', JSON.stringify(branch));
  };

  // Initialize from localStorage
  const initializeBranch = () => {
    const savedBranch = localStorage.getItem('activeBranch');
    if (savedBranch) {
      activeBranch.value = JSON.parse(savedBranch);
    }
  };

  // Add a new branch
  const addBranch = async (branchData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data } = await api.post('/branches', branchData);
      
      // Add to local state if successful
      branches.value.unshift(data.data || data);
      
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      console.error('Failed to add branch:', err);
      
      // Return errors in similar format to Laravel validation
      if (err.response?.status === 422) {
        return { errors: err.response.data.errors };
      }
      
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Update an existing branch
  const updateBranch = async (id, branchData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data } = await api.put(`/branches/${id}`, branchData);
      
      // Update local state
      const index = branches.value.findIndex(b => b.id === id);
      if (index !== -1) {
        branches.value[index] = data.data || data;
      }
      
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      console.error('Failed to update branch:', err);
      
      if (err.response?.status === 422) {
        return { errors: err.response.data.errors };
      }
      
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Delete a branch (soft delete)
  const deleteBranch = async (id) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await api.delete(`/branches/${id}`);
      
      // Remove from local state
      branches.value = branches.value.filter(b => b.id !== id);
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      console.error('Failed to delete branch:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Get a single branch by ID
  const getBranchById = (id) => {
    return branches.value.find(b => b.id === id);
  };

  return {
    branches,
    activeBranch,
    setActiveBranch,
    initializeBranch,
    isLoading,
    error,
    fetchBranches,
    addBranch,
    updateBranch,
    deleteBranch,
    getBranchById
  };
});