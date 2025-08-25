<template>
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
</template>

<script setup lang="ts">
import { ref } from "vue";

type Task = {
    id: number;
    title: string;
    status: string;
    category: string;
    deadline: string | Date | null;
};

const emit = defineEmits<{
    taskAdded: [];
    error: [message: string];
}>();

const newTaskTitle = ref("");
const newTaskCategory = ref("c");
const newTaskDeadline = ref("");
const addingTask = ref(false);

const addTask = async () => {
    if (newTaskTitle.value.trim() && !addingTask.value) {
        addingTask.value = true;
        const newTask: Task = {
            id: Math.floor(Date.now() / 1000),
            title: newTaskTitle.value.trim(),
            status: "todo",
            category: newTaskCategory.value,
            deadline: newTaskDeadline.value || null,
        };

        try {
            // Send to API
            const response = await $fetch("/api/tasks", {
                method: "POST",
                body: newTask,
            });

            // Clear form on success
            newTaskTitle.value = "";
            newTaskCategory.value = "c";
            newTaskDeadline.value = "";

            // Emit event to parent to reload tasks
            emit("taskAdded");
        } catch (err) {
            const errorMsg = err as any;
            const errorMessage =
                "Failed to add task: " +
                (errorMsg.data?.message || errorMsg.message || "Unknown error");

            emit("error", errorMessage);
            console.error("Error adding task:", err);
        } finally {
            addingTask.value = false;
        }
    }
};
</script>

<style scoped>
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

.add-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.add-btn:disabled:hover {
    background-color: var(--primary-color);
    transform: none;
}

@media (max-width: 768px) {
    .add-task-form {
        flex-direction: column;
    }

    .task-input,
    .category-input,
    .deadline-input {
        min-width: auto;
    }
}
</style>
