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
                <button @click="addTask" class="add-btn">Add Task</button>
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

        <div class="tasks-container">
            <div v-if="filteredTasks.length === 0" class="no-tasks">
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

<script setup>
import prisma from "~/lib/prisma";

const tasks_a = await prisma.task.findMany();
console.log(tasks_a);

import { ref, computed, onMounted } from "vue";

const newTaskTitle = ref("");
const newTaskCategory = ref("c");
const newTaskDeadline = ref("");
const activeFilter = ref("all");
const activeDateFilter = ref("all");
const tasks = ref([]);

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

// Sample initial data
const sampleTasks = [
    {
        id: 1,
        title: "Learn Nuxt.js",
        status: "in progress",
        category: "b",
        deadline: "2024-01-15",
    },
    {
        id: 2,
        title: "Build todo app",
        status: "todo",
        category: "a",
        deadline: "2024-01-20",
    },
    {
        id: 3,
        title: "Write documentation",
        status: "todo",
        category: "c",
        deadline: null,
    },
    {
        id: 4,
        title: "Setup project",
        status: "completed",
        category: "d",
        deadline: "2023-12-30",
    },
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

const addTask = () => {
    if (newTaskTitle.value.trim()) {
        const newTask = {
            id: Date.now(),
            title: newTaskTitle.value.trim(),
            status: "todo",
            category: newTaskCategory.value,
            deadline: newTaskDeadline.value || null,
        };
        tasks.value.push(newTask);
        newTaskTitle.value = "";
        newTaskCategory.value = "c";
        newTaskDeadline.value = "";
    }
};

const handleUpdateStatus = (taskId, newStatus) => {
    const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
        tasks.value[taskIndex].status = newStatus;
    }
};

const handleUpdateCategory = (taskId, newCategory) => {
    const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
        tasks.value[taskIndex].category = newCategory;
        // Trigger reactivity to re-sort the tasks
        tasks.value = [...tasks.value];
    }
};

const handleUpdateDeadline = (taskId, newDeadline) => {
    const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
        tasks.value[taskIndex].deadline = newDeadline || null;
    }
};

const handleDeleteTask = (taskId) => {
    const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
        tasks.value.splice(taskIndex, 1);
    }
};

const getTaskCount = (status) => {
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

onMounted(() => {
    // Load sample tasks on component mount
    tasks.value = [...sampleTasks];
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
