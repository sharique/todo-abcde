<template>
    <div class="task-list-container">
        <div class="task-list-header">
            <h2>Todo List</h2>
            <AddTaskForm
                @task-added="handleTaskAdded"
                @error="handleAddTaskError"
            />
        </div>

        <!-- Message Component -->
        <Message
            v-if="messageText"
            :message="messageText"
            :type="messageType"
            :show="showMessage"
            @dismiss="dismissMessage"
        />
        <categoriesExaplined />
        <div class="task-filters">
            <div class="filter-group">
                <label for="filter-select">Filter by status:</label>
                <div class="filter-buttons">
                    <button
                        v-for="filter in filters"
                        :key="filter.value"
                        @click="activeFilter = filter.value"
                        :class="[
                            'filter-btn',
                            { active: activeFilter === filter.value },
                        ]"
                    >
                        {{ filter.label }}
                    </button>
                </div>
            </div>

            <div class="filter-group">
                <label for="date-filter-select">Filter by date:</label>
                <div class="filter-buttons">
                    <button
                        v-for="dateFilter in dateFilters"
                        :key="dateFilter.value"
                        @click="activeDateFilter = dateFilter.value"
                        :class="[
                            'filter-btn',
                            { active: activeDateFilter === dateFilter.value },
                        ]"
                    >
                        {{ dateFilter.label }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="error-banner">
            <div class="error-content">
                <p class="error-message">{{ error }}</p>
                <button @click="dismissError" class="dismiss-btn">×</button>
            </div>
        </div>

        <div class="tasks-container">
            <div v-if="loading" class="loading-state">
                <p>Loading tasks...</p>
            </div>

            <div v-else-if="filteredTasks.length === 0" class="no-tasks">
                <p>{{ getEmptyMessage() }}</p>
            </div>

            <div v-else class="tasks-grid">
                <Task
                    v-for="task in filteredTasks"
                    :key="task.id"
                    :task="task"
                    @update-status="handleUpdateStatus"
                    @update-category="handleUpdateCategory"
                    @update-deadline="handleUpdateDeadline"
                    @delete-task="handleDeleteTask"
                    @task-deleted="handleTaskDeleted"
                    @task-updated="handleTaskUpdated"
                    @update-error="handleUpdateError"
                />
            </div>
        </div>

        <div class="task-summary">
            <p>
                Total: {{ tasks.length }} | Todo: {{ getTaskCount("todo") }} |
                In Progress: {{ getTaskCount("in progress") }} | Completed:
                {{ getTaskCount("completed") }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
type Task = {
    id: number;
    title: string;
    status: string;
    category: string;
    deadline: string | Date | null;
};

const activeFilter = ref("all");
const activeDateFilter = ref("all");
const tasks = ref<Task[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const messageText = ref("");
const messageType = ref<"success" | "error" | "info">("info");
const showMessage = ref(false);

const filters = [
    { value: "all", label: "All" },
    { value: "todo", label: "To Do" },
    { value: "in progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
];

const dateFilters = [
    { value: "all", label: "All" },
    { value: "yesterday", label: "Yesterday" },
    { value: "today", label: "Today" },
    { value: "tomorrow", label: "Tomorrow" },
];

const filteredTasks = computed(() => {
    let filtered;

    // Filter by status
    if (activeFilter.value === "all") {
        filtered = tasks.value;
    } else {
        filtered = tasks.value.filter(
            (task) => task.status === activeFilter.value,
        );
    }

    // Filter by date
    if (activeDateFilter.value !== "all") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        filtered = filtered.filter((task) => {
            if (!task.deadline) return false;

            const taskDate = new Date(task.deadline);
            taskDate.setHours(0, 0, 0, 0);

            switch (activeDateFilter.value) {
                case "yesterday":
                    return taskDate.getTime() === yesterday.getTime();
                case "today":
                    return taskDate.getTime() === today.getTime();
                case "tomorrow":
                    return taskDate.getTime() === tomorrow.getTime();
                default:
                    return true;
            }
        });
    }

    // Sort by category: A, B, C, D, E
    return filtered.sort((a, b) => a.category.localeCompare(b.category));
});

const handleTaskAdded = (taskTitle: string) => {
    loadTasks();
    showSuccessMessage(`Task "${taskTitle}" added successfully!`);
};

const handleAddTaskError = (errorMessage: string) => {
    error.value = errorMessage;
};

const handleTaskDeleted = (taskId: number, taskTitle: string) => {
    loadTasks();
    showSuccessMessage(`Task "${taskTitle}" deleted successfully!`);
};

const handleUpdateStatus = (taskId: number, newStatus: string) => {
    const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1 && tasks.value[taskIndex]) {
        tasks.value[taskIndex].status = newStatus;
    }
};

const handleUpdateCategory = (taskId: number, newCategory: string) => {
    const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1 && tasks.value[taskIndex]) {
        tasks.value[taskIndex].category = newCategory;
        // Trigger reactivity to re-sort the tasks
        tasks.value = [...tasks.value];
    }
};

const handleUpdateDeadline = (
    taskId: number,
    newDeadline: string | Date | null,
) => {
    const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1 && tasks.value[taskIndex]) {
        tasks.value[taskIndex].deadline = newDeadline || null;
    }
};

const handleTaskUpdated = (taskTitle: string, field: string, value: string) => {
    showSuccessMessage(`Task "${taskTitle}" ${field} updated to "${value}"`);
};

const handleUpdateError = (errorMessage: string) => {
    showErrorMessage(errorMessage);
};

const handleDeleteTask = (taskId: number) => {
    const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1 && tasks.value[taskIndex]) {
        tasks.value.splice(taskIndex, 1);
    }
};

const getTaskCount = (status: string) => {
    return tasks.value.filter((task) => task.status === status).length;
};

const getEmptyMessage = () => {
    if (activeFilter.value === "all" && activeDateFilter.value === "all") {
        return "No tasks yet. Add your first task!";
    }

    let message = "No tasks found";
    if (activeFilter.value !== "all") {
        message += ` with status "${activeFilter.value}"`;
    }
    if (activeDateFilter.value !== "all") {
        message += ` for ${activeDateFilter.value}`;
    }
    return message + ".";
};

const loadTasks = async () => {
    loading.value = true;
    error.value = null;

    try {
        const response = (await $fetch("/api/tasks")) as any;
        tasks.value = response?.data || [];
    } catch (err: any) {
        error.value = err?.message || "Failed to load tasks";
        console.error("Error loading tasks:", err);
        // Fallback to empty array if API fails
        tasks.value = [];
    } finally {
        loading.value = false;
    }
};

const dismissError = () => {
    error.value = null;
};

const showSuccessMessage = (message: string) => {
    messageText.value = message;
    messageType.value = "success";
    showMessage.value = true;
};

const showErrorMessage = (message: string) => {
    messageText.value = message;
    messageType.value = "error";
    showMessage.value = true;
};

const dismissMessage = () => {
    showMessage.value = false;
    setTimeout(() => {
        messageText.value = "";
    }, 300); // Wait for transition to complete
};

onMounted(() => {
    loadTasks();
});
</script>

<style scoped>
.task-list-container {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--spacing-2xl);
}

.task-list-header {
    margin-bottom: var(--spacing-xl);
}

.task-list-header h2 {
    margin: 0 0 var(--spacing-lg) 0;
    color: var(--gray-700);
    font-size: var(--font-size-2xl);
}

.task-filters {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.filter-group label {
    font-size: var(--font-size-sm);
    color: var(--gray-600);
    font-weight: var(--font-weight-medium);
}

.filter-buttons {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
}

.filter-btn {
    padding: var(--spacing-sm) var(--spacing-lg);
    border: 1px solid var(--gray-300);
    background-color: var(--white);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--font-size-sm);
    transition: all 0.2s;
}

.filter-btn:hover {
    background-color: var(--gray-50);
}

.filter-btn.active {
    background-color: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
}

.tasks-container {
    min-height: 300px;
    margin-bottom: var(--spacing-2xl);
}

.no-tasks {
    text-align: center;
    padding: var(--spacing-3xl);
    color: var(--gray-600);
}

.no-tasks p {
    font-size: var(--font-size-lg);
}

.tasks-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.task-summary {
    background-color: var(--gray-50);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    text-align: center;
    color: var(--gray-600);
    font-size: var(--font-size-sm);
}

.loading-state,
.error-state {
    text-align: center;
    padding: var(--spacing-3xl);
    color: var(--gray-600);
}

.error-state {
    color: var(--danger-color);
}

.retry-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-sm) var(--spacing-lg);
    border: 1px solid var(--primary-color);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    background-color: var(--white);
    color: var(--primary-color);
    margin-top: var(--spacing-md);
    transition: all 0.2s;
}

.retry-btn:hover {
    background-color: var(--primary-color);
    color: var(--white);
}

.add-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.add-btn:disabled:hover {
    background-color: var(--primary-color);
    transform: none;
}

.error-banner {
    background-color: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: var(--radius-sm);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
}

.error-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.error-message {
    color: var(--danger-color);
    font-size: var(--font-size-sm);
    margin: 0;
}

.dismiss-btn {
    background: none;
    border: none;
    color: var(--danger-color);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    transition: background-color 0.2s;
}

.dismiss-btn:hover {
    background-color: #fecaca;
}

@media (max-width: 768px) {
    .task-list-container {
        padding: var(--spacing-lg);
    }

    .filter-group {
        gap: var(--spacing-xs);
    }

    .filter-buttons {
        gap: var(--spacing-xs);
    }
}
</style>
