<template>
    <div class="task-item" :data-category="task.category">
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

<script setup>
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
]);

const updateStatus = () => {
    emit("update-status", props.task.id, props.task.status);
};

const updateCategory = () => {
    emit("update-category", props.task.id, props.task.category);
};

const updateDeadline = () => {
    emit("update-deadline", props.task.id, props.task.deadline);
};

const deleteTask = () => {
    emit("delete-task", props.task.id);
};
</script>

<style scoped>
.task-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    margin-bottom: 0.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
}

.task-content {
    flex: 1;
}

.task-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
}

.task-details {
    display: flex;
    gap: 0.5rem;
}

.task-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.task-field label {
    font-size: 0.9rem;
    color: #666;
    min-width: 80px;
}

.status-select,
.category-select,
.deadline-input {
    padding: 0.25rem 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
    min-width: 120px;
}

.status-select:disabled,
.category-select:disabled,
.deadline-input:disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
}

.task-actions {
    margin-left: 1rem;
}

.delete-btn {
    background-color: #ff4444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
}

.delete-btn:hover {
    background-color: #cc0000;
}

/* Status-based styling */
.task-item:has(.status-select[value="completed"]) {
    background-color: #e8f5e8;
    border-color: #4caf50;
}

.task-item:has(.status-select[value="in progress"]) {
    background-color: #fff3e0;
    border-color: #ff9800;
}

.task-item:has(.status-select[value="todo"]) {
    background-color: #f3f4f6;
    border-color: #9ca3af;
}

@media (max-width: 768px) {
    .task-details {
        gap: 0.25rem;
    }

    .task-field {
        flex-direction: column;
        align-items: flex-start;
    }

    .task-field label {
        min-width: auto;
    }
}
</style>
