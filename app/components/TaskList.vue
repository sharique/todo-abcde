<template>
    <div class="task-list-container">
        <div class="task-list-header">
            <h2>Todo List</h2>
            <div class="add-task-form">
                <input
                    v-model="newTaskTitle"
                    type="text"
                    placeholder="Enter new task title"
                    class="task-input"
                    @keyup.enter="addTask"
                    required
                />
                <select v-model="newTaskCategory" class="category-input">
                    <option value="a">Category A</option>
                    <option value="b">Category B</option>
                    <option value="c">Category C</option>
                    <option value="d">Category D</option>
                    <option value="e">Category E</option>
                </select>
                <input
                    v-model="newTaskDeadline"
                    type="date"
                    class="deadline-input"
                    placeholder="Optional deadline"
                />
                <button @click="addTask" class="add-btn" :disabled="addingTask">
                    {{ addingTask ? "Adding..." : "Add Task" }}
                </button>
            </div>
        </div>
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

const newTaskTitle = ref("");
const newTaskCategory = ref("c");
const newTaskDeadline = ref("");
const activeFilter = ref("all");
const activeDateFilter = ref("all");
const tasks = ref<Task[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const addingTask = ref(false);

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

const addTask = async () => {
    if (newTaskTitle.value.trim() && !addingTask.value) {
        addingTask.value = true;
        const newTask: Task = {
            id: Math.random() * 100,
            title: newTaskTitle.value.trim(),
            status: "todo",
            category: newTaskCategory.value,
            deadline: newTaskDeadline.value || null,
        };

        try {
            // Add task locally first for immediate feedback
            tasks.value.push(newTask);

            // Clear form immediately for better UX
            newTaskTitle.value = "";
            newTaskCategory.value = "c";
            newTaskDeadline.value = "";

            // Send to API
            const response = await $fetch("/api/tasks", {
                method: "POST",
                body: newTask,
            });

            // Update local task with server response if needed
            if (response && response.data) {
                const index = tasks.value.findIndex(
                    (task) => task.id === newTask.id,
                );
                if (index !== -1) {
                    tasks.value[index] = { ...newTask, ...response.data };
                }
            }
        } catch (err) {
            // Remove from local state if API call fails
            const index = tasks.value.findIndex(
                (task) => task.id === newTask.id,
            );
            if (index !== -1) {
                tasks.value.splice(index, 1);
            }

            // Restore form values on error
            newTaskTitle.value = newTask.title;
            newTaskCategory.value = newTask.category;
            newTaskDeadline.value =
                typeof newTask.deadline === "string" ? newTask.deadline : "";

            const errorMsg = err as any;
            error.value =
                "Failed to add task: " +
                (errorMsg.data?.message || errorMsg.message || "Unknown error");
            console.error("Error adding task:", err);
        } finally {
            addingTask.value = false;
        }
    }
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

.add-task-form {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
    flex-wrap: wrap;
}

.task-input {
    flex: 1;
    padding: var(--spacing-md);
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-base);
    transition:
        border-color 0.2s,
        box-shadow 0.2s;
    min-width: 200px;
}

.task-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgb(76 175 80 / 0.1);
}

.category-input,
.deadline-input {
    padding: var(--spacing-md);
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-base);
    transition:
        border-color 0.2s,
        box-shadow 0.2s;
    min-width: 120px;
}

.category-input:focus,
.deadline-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgb(76 175 80 / 0.1);
}

.add-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md) var(--spacing-xl);
    border: none;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    text-decoration: none;
    transition:
        background-color 0.2s,
        transform 0.1s;
    background-color: var(--primary-color);
    color: var(--white);
}

.add-btn:hover {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
}

.add-btn:active {
    transform: translateY(0);
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

    .add-task-form {
        flex-direction: column;
    }

    .task-input,
    .category-input,
    .deadline-input {
        min-width: auto;
    }

    .filter-group {
        gap: var(--spacing-xs);
    }

    .filter-buttons {
        gap: var(--spacing-xs);
    }
}
</style>
