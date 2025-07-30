// stores/shift.ts
import { defineStore } from "pinia";

export const useShiftStore = defineStore("shift", () => {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = runtimeConfig.public.apiBase;

  // State
  const shifts = ref([]);
  const stores = ref([]);
  const staff = ref([]);
  const stats = ref({
    totalStaff: 0,
    totalShifts: 0,
    totalHours: 0,
    coverageRate: 0,
  });
  const currentWeek = ref(new Date());
  const selectedStore = ref("");
  const loading = ref(false);

  // Get token from localStorage (handle cases where it's missing)
  const getAuthToken = () => {
    return localStorage.getItem("token") || ""; // Replace 'auth_token' with your key
  };

  // Define common headers
  const commonHeaders = {
    Authorization: `Bearer ${getAuthToken()}`,
    "Content-Type": "application/json",
  };

  // Getters
  const weekStart = computed(() => getWeekStart(currentWeek.value));
  const weekDays = computed(() => getWeekDays(weekStart.value));
  const currentStoreName = computed(() => {
    return stores.value.find((s) => s.id === selectedStore.value)?.name || "";
  });

  // Actions
  const fetchInitialData = async () => {
    try {
      loading.value = true;
      
      const [branchesRes, staffRes] = await Promise.all([
        $fetch(baseURL + "/branches", { headers: commonHeaders }),
        $fetch(baseURL + "/staff", { headers: commonHeaders }),
      ]);

      stores.value = branchesRes.branches;
      staff.value = staffRes.staff;

      if (stores.value.length) {
        selectedStore.value = stores.value[0].id;
        await fetchShifts();
        await fetchStats();
      }
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchShifts = async () => {
    if (!selectedStore.value) return;

    try {
      loading.value = true;
      const date = formatDate(currentWeek.value);
      const response = await $fetch(`${baseURL}/shifts/week/${date}`, {
        headers: commonHeaders,
        params: { branch_id: selectedStore.value },
      });

      shifts.value = response.shifts;
    } catch (err) {
      console.error("Failed to fetch shifts:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchStats = async () => {
    if (!selectedStore.value) return;

    try {
      const response = await $fetch(`${baseURL}/shifts/stats`, {
        headers: commonHeaders,
        params: {
          branch_id: selectedStore.value,
          date: formatDate(currentWeek.value),
        },
      });

      stats.value = response;
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const addShift = async (shiftData) => {
    try {
      const response = await $fetch(baseURL + "/shifts", {
        method: "POST",
        headers: commonHeaders,
        body: shiftData,
      });

      await fetchShifts();
      await fetchStats();
      return response;
    } catch (err) {
      console.error("Error adding shift:", err.response);
      return err.response._data;
    }
  };

  const updateShift = async (shiftId, updatedData) => {
    try {
      const response = await $fetch(`${baseURL}/shifts/${shiftId}`, {
        method: "PATCH",
        headers: commonHeaders,
        body: updatedData,
      });

      await fetchShifts();
      await fetchStats();
      return response;
    } catch (err) {
      console.error("Error updating shift:", err.response);
      return err.response._data;
    }
  };

  const deleteShift = async (shiftId) => {
    try {
      const response = await $fetch(`${baseURL}/shifts/${shiftId}`, {
        method: "DELETE",
        headers: commonHeaders
      });

      await fetchShifts();
      await fetchStats();
      return response;
    } catch (err) {
      console.error("Error deleting shift:", err.response);
      return err.response._data;
    }
  };

  const navigateWeek = async (direction) => {
    const newDate = new Date(currentWeek.value);
    newDate.setDate(
      currentWeek.value.getDate() + (direction === "next" ? 7 : -7)
    );
    currentWeek.value = newDate;
    await fetchShifts();
    await fetchStats();
  };

  // Helper functions
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeekDays = (startDate) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const getShiftForStaffAndDate = (staffId, date) => {
    const dateString = formatDate(date);
    return shifts.value.find(
      (shift) =>
        shift.user_id === staffId &&
        shift.branch_id === selectedStore.value &&
        shift.date === dateString
    );
  };

  return {
    // State
    shifts,
    stores,
    staff,
    stats,
    currentWeek,
    selectedStore,
    loading,

    // Getters
    weekStart,
    weekDays,
    currentStoreName,

    // Actions
    fetchInitialData,
    fetchShifts,
    fetchStats,
    addShift,
    updateShift,
    deleteShift,
    navigateWeek,
    formatDate,

    // Helpers
    getShiftForStaffAndDate,
  };
});
