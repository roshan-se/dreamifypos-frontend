<template>
  <div>
    <div
      class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
      <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h1 class="text-2xl font-bold text-gray-900">Shift Management</h1>
              <div class="flex items-center space-x-2">
                <Store class="h-4 w-4 text-gray-500" />
                <Select
                  v-model="shiftStore.selectedStore"
                  @update:model-value="shiftStore.fetchShifts">
                  <SelectTrigger class="w-48">
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="store in shiftStore.stores"
                      :key="store.id"
                      :value="store.id">
                      {{ store.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Dialog v-model:open="isAddShiftOpen">
              <DialogTrigger asChild>
                <Button>
                  <Plus class="h-4 w-4 mr-2" />
                  Add Shift
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Shift</DialogTitle>
                </DialogHeader>
                <div class="space-y-4">
                  <div>
                    <Label for="staff">Staff Member</Label>
                    <Select v-model="form.staffId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          v-for="member in shiftStore.staff"
                          :key="member.id"
                          :value="member.id">
                          {{ member.name }} - {{ member.role }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label for="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      v-model="form.date" />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <Label for="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        v-model="form.startTime" />
                    </div>
                    <div>
                      <Label for="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        v-model="form.endTime" />
                    </div>
                  </div>

                  <Button
                    @click="handleAddShift"
                    class="w-full"
                    :disabled="
                      !form.staffId ||
                      !form.date ||
                      !form.startTime ||
                      !form.endTime
                    ">
                    Add Shift
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <!-- Week Navigation -->
        <div class="px-6 py-4 bg-white border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                @click="shiftStore.navigateWeek('prev')"
                :disabled="shiftStore.loading">
                <ChevronLeft class="h-4 w-4" />
              </Button>
              <h2 class="text-lg font-semibold">{{ getWeekRange() }}</h2>
              <Button
                variant="outline"
                size="sm"
                @click="shiftStore.navigateWeek('next')"
                :disabled="shiftStore.loading">
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              @click="handleTodayClick"
              :disabled="shiftStore.loading">
              Today
            </Button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="px-6 py-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader
                class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Total Staff</CardTitle>
                <Users class="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">
                  {{ shiftStore.stats.total_staff }}
                </div>
                <p class="text-xs text-muted-foreground">Active employees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">This Week</CardTitle>
                <Calendar class="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">
                  {{ shiftStore.stats.total_shifts }}
                </div>
                <p class="text-xs text-muted-foreground">
                  Total shifts scheduled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Total Hours</CardTitle>
                <Clock class="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">
                   <!-- TODO: Need to fix this issue later -->
                  {{ shiftStore.stats.total_hours * - 1 }}
                </div>
                <p class="text-xs text-muted-foreground">Hours this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Coverage</CardTitle>
                <Store class="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">
                  {{ shiftStore.stats.coverage_rate }}%
                </div>
                <p class="text-xs text-muted-foreground">Store coverage rate</p>
              </CardContent>
            </Card>
          </div>

          <!-- Staff Schedule Table -->
          <Card>
            <CardHeader>
              <CardTitle
                >Weekly Schedule - {{ shiftStore.currentStoreName }}</CardTitle
              >
            </CardHeader>
            <CardContent>
              <div class="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead class="w-48">Staff Member</TableHead>
                      <TableHead
                        v-for="(day, index) in shiftStore.weekDays"
                        :key="index"
                        class="text-center min-w-32">
                        <div class="flex flex-col">
                          <span class="font-medium">{{
                            formatDisplayDate(day)
                          }}</span>
                          <span class="text-xs text-gray-500 font-normal">
                            {{
                              day.toLocaleDateString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                              })
                            }}
                          </span>
                        </div>
                      </TableHead>
                      <TableHead class="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow
                      v-for="member in shiftStore.staff"
                      :key="member.id">
                      <TableCell>
                        <div>
                          <div class="font-medium">{{ member.name }}</div>
                          <div class="text-sm text-gray-500">
                            {{ member.role }}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        v-for="(day, index) in shiftStore.weekDays"
                        :key="index"
                        class="text-center"
                        @click="openEditShiftDialog(member.id, day)">
                        <template
                          v-if="
                            shiftStore.getShiftForStaffAndDate(member.id, day)
                          ">
                          <Badge
                            variant="secondary"
                            class="text-xs">
                            {{
                              formatTime(
                                shiftStore.getShiftForStaffAndDate(
                                  member.id,
                                  day
                                ).start_time
                              )
                            }}
                            -
                            {{
                              formatTime(
                                shiftStore.getShiftForStaffAndDate(
                                  member.id,
                                  day
                                ).end_time
                              )
                            }}
                          </Badge>
                        </template>
                        <template v-else>
                          <span class="text-gray-400 text-sm">Off</span>
                        </template>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm">
                              <MoreHorizontal class="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            
                            <DropdownMenuItem
                              class="text-red-600"
                              @click="confirmDeleteShift(member.id)">
                              <Trash2 class="h-4 w-4 mr-2" />
                              Remove All Shifts
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <Dialog v-model:open="isEditShiftOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Shift</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label for="staff">Staff Member</Label>
            <Select
              v-model="editForm.staffId"
              disabled>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="member in shiftStore.staff"
                  :key="member.id"
                  :value="member.id">
                  {{ member.name }} - {{ member.role }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label for="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              v-model="editForm.date"
              disabled />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="edit-start-time">Start Time</Label>
              <Input
                id="edit-start-time"
                type="time"
                v-model="editForm.startTime" />
            </div>
            <div>
              <Label for="edit-end-time">End Time</Label>
              <Input
                id="edit-end-time"
                type="time"
                v-model="editForm.endTime" />
            </div>
          </div>

          <div class="flex gap-2">
            <!-- Delete Button -->
            <Button
              variant="destructive"
              @click="confirmDeleteCurrentShift"
              class="flex-1">
              <Trash2 class="h-4 w-4 mr-2" />
              Delete Shift
            </Button>

            <!-- Update Button -->
            <Button
              @click="handleEditShift"
              class="flex-1"
              :disabled="!editForm.startTime || !editForm.endTime">
              Update Shift
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  Plus,
  Edit,
  Trash2,
  Store,
  Users,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Store
const shiftStore = useShiftStore();

// Local state
const isAddShiftOpen = ref(false);
const form = reactive({
  staffId: "",
  date: "",
  startTime: "",
  endTime: "",
});

const isEditShiftOpen = ref(false);
const editForm = reactive({
  shiftId: "",
  staffId: "",
  staffName: "",
  date: "",
  startTime: "",
  endTime: "",
});

// Initialize
onMounted(() => {
  shiftStore.fetchInitialData();
});

// Helpers (can also be moved to the store)
const formatDisplayDate = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (time) => {
  const [hours, minutes] = time.split(":");
  const hour = Number.parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getWeekRange = () => {
  const endDate = new Date(shiftStore.weekStart);
  endDate.setDate(shiftStore.weekStart.getDate() + 6);
  return `${shiftStore.weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
};

// Handlers
const handleAddShift = async () => {
  const response = await shiftStore.addShift({
    user_id: form.staffId,
    branch_id: shiftStore.selectedStore,
    date: form.date,
    start_time: form.startTime,
    end_time: form.endTime,
  });

  if (!response.error) {
    isAddShiftOpen.value = false;
    resetForm();
  }
};

const handleTodayClick = () => {
  shiftStore.currentWeek = new Date();
  shiftStore.fetchShifts();
  shiftStore.fetchStats();
};

const confirmDeleteShift = async (staffId) => {
  // Find all shifts for this staff member in the current week
  const shiftsToDelete = shiftStore.shifts.filter(
    (shift) =>
      shift.user_id === staffId &&
      shiftStore.weekDays.some(
        (day) => shiftStore.formatDate(day) === shift.date
      )
  );

  if (!shiftsToDelete.length) return;

  if (
    confirm(`Delete ${shiftsToDelete.length} shift(s) for this staff member?`)
  ) {
    for (const shift of shiftsToDelete) {
      await shiftStore.deleteShift(shift.id);
    }
  }
};

const confirmDeleteCurrentShift = async () => {
  if (confirm('Are you sure you want to delete this shift?')) {
    if (editForm.shiftId) {
      await shiftStore.deleteShift(editForm.shiftId)
      isEditShiftOpen.value = false
      resetEditForm()
    }
  }
}


const resetForm = () => {
  form.staffId = "";
  form.date = "";
  form.startTime = "";
  form.endTime = "";
};

const openEditShiftDialog = (staffId, day) => {
  const shift = shiftStore.getShiftForStaffAndDate(staffId, day);
  if (!shift) {
    // Optionally create a new shift if none exists
    const staffMember = shiftStore.staff.find((m) => m.id === staffId);

    console.log("this is staff detail", staffMember);
    editForm.staffId = staffId;
    editForm.staffName = staffMember.name;
    editForm.date = shiftStore.formatDate(day);
    editForm.startTime = "";
    editForm.endTime = "";
    editForm.shiftId = null;
  } else {
    console.log(shift);
    editForm.shiftId = shift.id;
    editForm.staffId = staffId;
    editForm.staffName = shift.name;
    editForm.date = shift.date;
    editForm.startTime = shift.start_time;
    editForm.endTime = shift.end_time;
  }
  isEditShiftOpen.value = true;
};

const handleEditShift = async () => {
  const shiftData = {
    id: editForm.shiftId,
    user_id: editForm.staffId,
    branch_id: shiftStore.selectedStore,
    date: editForm.date,
    start_time: editForm.startTime,
    end_time: editForm.endTime,
  };

  const response = await shiftStore.updateShift(editForm.shiftId, shiftData);

  if (!response.error) {
    isEditShiftOpen.value = false;
    resetEditForm();
  }
};

const resetEditForm = () => {
  editForm.shiftId = "";
  editForm.staffId = "";
  editForm.staffName = "";
  editForm.date = "";
  editForm.startTime = "";
  editForm.endTime = "";
};
</script>
