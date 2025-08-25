<template>
    <div
        class="task-item"
        :class="`category-${task.category}`"
        :data-category="task.category"
    >
        <div class="task-content">
            <h3 class="task-title">{{ task.title }}</h3>
            <div class="task-details">
                <div class="task-field">
                    <label for="status-select">Status:</label>
                    <select
                        id="status-select"
                        v-model="task.status"
                        @change="updateStatus"
                        class="status-select"
                        :disabled="task.status === 'completed'"
                    >
                        <option value="todo">To Do</option>
                        <option value="in progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div class="task-field">
                    <label for="category-select">Category:</label>
                    <select
                        id="category-select"
                        v-model="task.category"
                        @change="updateCategory"
                        class="category-select"
                        :disabled="task.status === 'completed'"
                    >
                        <option value="a">A</option>
                        <option value="b">B</option>
                        <option value="c">C</option>
                        <option value="d">D</option>
                        <option value="e">E</option>
                    </select>
                </div>
                <div class="task-field">
                    <label for="deadline-input">Deadline:</label>
                    <input
                        id="deadline-input"
                        v-model="task.deadline"
                        type="date"
                        @change="updateDeadline"
                        class="deadline-input"
                        :disabled="task.status === 'completed'"
                    />
                </div>
            </div>
        </div>
        <div class="task-actions">
            <button @click="deleteTask" class="delete-btn">Delete</button>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    task: {
        type: Object,
        required: true,
        default: () => ({
            id: null,
            title: "",
            status: "todo",
            category: "c",
            deadline: null,
        }),
    },
});

const emit = defineEmits([
    "update-status",
    "update-category",
    "update-deadline",
    "delete-task",
    "task-deleted",
    "task-updated",
    "update-error",
]);

const updateStatus = async () => {
    try {
        await $fetch(`/api/tasks/${props.task.id}`, {
            method: "PUT",
            body: {
                status: props.task.status,
            },
        });
        emit("update-status", props.task.id, props.task.status);
        emit("task-updated", props.task.title, "status", props.task.status);
    } catch (error) {
        console.error("Failed to update task status:", error);
        const errorMsg = error as any;
        emit(
            "update-error",
            `Failed to update status: ${errorMsg.data?.message || errorMsg.message || "Unknown error"}`,
        );
    }
};

const updateCategory = async () => {
    try {
        await $fetch(`/api/tasks/${props.task.id}`, {
            method: "PUT",
            body: {
                category: props.task.category,
            },
        });
        emit("update-category", props.task.id, props.task.category);
        emit("task-updated", props.task.title, "category", props.task.category);
    } catch (error) {
        console.error("Failed to update task category:", error);
        const errorMsg = error as any;
        emit(
            "update-error",
            `Failed to update category: ${errorMsg.data?.message || errorMsg.message || "Unknown error"}`,
        );
    }
};

const updateDeadline = async () => {
    try {
        await $fetch(`/api/tasks/${props.task.id}`, {
            method: "PUT",
            body: {
                deadline: props.task.deadline,
            },
        });
        emit("update-deadline", props.task.id, props.task.deadline);
        const deadlineText = props.task.deadline || "removed";
        emit("task-updated", props.task.title, "deadline", deadlineText);
    } catch (error) {
        console.error("Failed to update task deadline:", error);
        const errorMsg = error as any;
        emit(
            "update-error",
            `Failed to update deadline: ${errorMsg.data?.message || errorMsg.message || "Unknown error"}`,
        );
    }
};

const deleteTask = async () => {
    try {
        await $fetch(`/api/tasks/${props.task.id}`, {
            method: "DELETE",
        });

        emit("task-deleted", props.task.id, props.task.title);
    } catch (error) {
        console.error("Failed to delete task:", error);
        // Fallback to old behavior for backward compatibility
        emit("delete-task", props.task.id);
    }
};
</script>

<style scoped>
.task-item {
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-sm);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease-in-out;
    margin-bottom: var(--spacing-sm);
}

.task-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.task-content {
    flex: 1;
}

.task-title {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--gray-700);
}

.task-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.task-field {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.task-field label {
    font-size: var(--font-size-sm);
    color: var(--gray-600);
    font-weight: var(--font-weight-medium);
    min-width: 80px;
}

.status-select,
.category-select,
.deadline-input {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--gray-400);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    transition:
        border-color 0.2s,
        box-shadow 0.2s;
    min-width: 120px;
}

.status-select:focus,
.category-select:focus,
.deadline-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgb(76 175 80 / 0.1);
}

.status-select:disabled,
.category-select:disabled,
.deadline-input:disabled {
    background-color: var(--gray-100);
    color: var(--gray-500);
    cursor: not-allowed;
}

.task-actions {
    margin-left: var(--spacing-lg);
}

.delete-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-sm) var(--spacing-md);
    border: none;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    text-decoration: none;
    transition:
        background-color 0.2s,
        transform 0.1s;
    background-color: var(--danger-color);
    color: var(--white);
}

.delete-btn:hover {
    background-color: var(--danger-hover);
    transform: translateY(-1px);
}

.delete-btn:active {
    transform: translateY(0);
}

/* Status-based styling */
.task-item:has(.status-select[value="completed"]) {
    background-color: var(--completed-bg);
    border-color: var(--completed-border);
}

.task-item:has(.status-select[value="in progress"]) {
    background-color: var(--in-progress-bg);
    border-color: var(--in-progress-border);
}

.task-item:has(.status-select[value="todo"]) {
    background-color: var(--todo-bg);
    border-color: var(--todo-border);
}

@media (max-width: 768px) {
    .task-field {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
    }

    .task-field label {
        min-width: auto;
    }
}
</style>
