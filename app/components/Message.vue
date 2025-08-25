<template>
    <Transition name="message">
        <div
            v-if="visible"
            :class="['message', `message-${type}`]"
            role="alert"
        >
            <div class="message-content">
                <div class="message-icon">
                    <svg
                        v-if="type === 'success'"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    <svg
                        v-else-if="type === 'error'"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    <svg
                        v-else
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </div>
                <p class="message-text">{{ message }}</p>
                <button
                    @click="dismiss"
                    class="message-dismiss"
                    aria-label="Dismiss message"
                >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

interface Props {
    message: string;
    type?: "success" | "error" | "info";
    duration?: number;
    show?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    type: "info",
    duration: 5000,
    show: false,
});

const emit = defineEmits<{
    dismiss: [];
}>();

const visible = ref(false);
let timeoutId: NodeJS.Timeout | null = null;

const dismiss = () => {
    visible.value = false;
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    emit("dismiss");
};

const showMessage = () => {
    visible.value = true;

    if (props.duration > 0) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            dismiss();
        }, props.duration);
    }
};

// Watch for show prop changes
watch(() => props.show, (newValue) => {
    if (newValue) {
        showMessage();
    } else {
        dismiss();
    }
});

// Show message on mount if show prop is true
onMounted(() => {
    if (props.show) {
        showMessage();
    }
});
</script>

<style scoped>
.message {
    position: relative;
    margin-bottom: var(--spacing-lg);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid;
}

.message-success {
    background-color: #f0fdf4;
    border-color: #bbf7d0;
    color: #166534;
}

.message-error {
    background-color: #fef2f2;
    border-color: #fecaca;
    color: #dc2626;
}

.message-info {
    background-color: #eff6ff;
    border-color: #bfdbfe;
    color: #1d4ed8;
}

.message-content {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
}

.message-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    margin-top: 2px;
}

.message-text {
    flex: 1;
    margin: 0;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
}

.message-dismiss {
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--radius-sm);
    color: currentColor;
    opacity: 0.7;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.message-dismiss:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.05);
}

.message-dismiss:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}

/* Transition animations */
.message-enter-active,
.message-leave-active {
    transition: all 0.3s ease;
}

.message-enter-from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
}

.message-leave-to {
    opacity: 0;
    transform: translateY(-5px) scale(0.98);
}

@media (max-width: 768px) {
    .message {
        padding: var(--spacing-md);
    }

    .message-content {
        gap: var(--spacing-xs);
    }
}
</style>
