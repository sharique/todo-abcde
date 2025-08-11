<template>
    <div class="categories-explanation">
        <div class="flex justify-between">
            <h3 class="categories-title">Explanation of Categories</h3>
            <button class="toggle btn" @click="onToggle">{{ toggle }}</button>
        </div>
        <ul class="categories-list" :class="toggle">
            <li class="category-item category-a">
                <span class="category-label">Category A:</span> Must do,
                important, urgent
            </li>
            <li class="category-item category-b">
                <span class="category-label">Category B:</span> Should do,
                important, not urgent
            </li>
            <li class="category-item category-c">
                <span class="category-label">Category C:</span> Nice to have,
                neutral
            </li>
            <li class="category-item category-d">
                <span class="category-label">Category D:</span> Not important,
                delegate
            </li>
            <li class="category-item category-e">
                <span class="category-label">Category E:</span> Eliminate, tasks
                have no longer value
            </li>
        </ul>
    </div>
</template>

<style scoped>
.categories-explanation {
    background-color: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-sm);
    margin-bottom: var(--spacing-xl);
}

.categories-title {
    margin-bottom: var(--spacing-md);
    font-weight: var(--font-weight-semibold);
    color: var(--primary-color);
}

.categories-list {
    margin: 0;
    padding: 0;
    list-style: none;
    &.hide {
        display: none;
        transition: fade 1s;
    }
}

.category-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-xs);
    border-left: 4px solid var(--gray-300);
}

.category-label {
    font-weight: var(--font-weight-semibold);
    min-width: 80px;
}

.category-a {
    background-color: #fef2f2;
    border-left-color: var(--danger-color);
}

.category-a .category-label {
    color: var(--danger-color);
}

.category-b {
    background-color: #fff7ed;
    border-left-color: var(--warning-color);
}

.category-b .category-label {
    color: var(--warning-color);
}

.category-c {
    background-color: var(--gray-50);
    border-left-color: var(--gray-400);
}

.category-c .category-label {
    color: var(--gray-600);
}

.category-d {
    background-color: #eff6ff;
    border-left-color: #3b82f6;
}

.category-d .category-label {
    color: #3b82f6;
}

.category-e {
    background-color: #f3f4f6;
    border-left-color: var(--gray-500);
}

.category-e .category-label {
    color: var(--gray-500);
}
.toggle.btn {
    margin-bottom: var(--spacing-sm);
}
</style>
<script lang="ts" scoped>
export default {
    data() {
        return {
            toggle: "show",
        };
    },
    methods: {
        onToggle() {
            if (this.toggle === "show") {
                this.toggle = "hide";
            } else {
                this.toggle = "show";
            }
        },
    },
};
</script>
