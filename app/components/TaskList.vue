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
import { ref, computed, onMounted } from "vue";

const newTaskTitle = ref("");
const newTaskCategory = ref("c");
const newTaskDeadline = ref("");
const activeFilter = ref("all");
const tasks = ref([]);

const filters = [
    { value: "all", label: "All" },
    { value: "todo", label: "To Do" },
    { value: "in progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
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
    if (activeFilter.value === "all") {
        filtered = tasks.value;
    } else {
        filtered = tasks.value.filter(
            (task) => task.status === activeFilter.value,
        );
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
    if (activeFilter.value === "all") {
        return "No tasks yet. Add your first task!";
    }
    return `No ${activeFilter.value} tasks found.`;
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
    padding: 2rem;
}

.task-list-header {
    margin-bottom: 2rem;
}

.task-list-header h2 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 2rem;
}

.add-task-form {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.task-input {
    flex: 2;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    min-width: 200px;
}

.category-input,
.deadline-input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    min-width: 120px;
}

.task-input:focus,
.category-input:focus,
.deadline-input:focus {
    outline: none;
    border-color: #4caf50;
}

.add-btn {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
}

.add-btn:hover {
    background-color: #45a049;
}

.task-filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.filter-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
}

.filter-btn:hover {
    background-color: #f5f5f5;
}

.filter-btn.active {
    background-color: #4caf50;
    color: white;
    border-color: #4caf50;
}

.tasks-container {
    min-height: 300px;
    margin-bottom: 2rem;
}

.no-tasks {
    text-align: center;
    padding: 3rem;
    color: #666;
}

.no-tasks p {
    font-size: 1.1rem;
}

.tasks-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.task-summary {
    text-align: center;
    padding: 1rem;
    background-color: #f5f5f5;
    border-radius: 8px;
    color: #666;
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .task-list-container {
        padding: 1rem;
    }

    .add-task-form {
        flex-direction: column;
    }

    .task-input,
    .category-input,
    .deadline-input {
        min-width: auto;
    }

    .task-filters {
        flex-wrap: wrap;
    }
}
</style>
