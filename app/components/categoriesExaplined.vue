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
    border-left-width: 4px;
    border-left-style: solid;
}

.category-label {
    font-weight: var(--font-weight-semibold);
    min-width: 80px;
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
