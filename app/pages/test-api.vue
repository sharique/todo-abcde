<template>
  <div class="test-page">
    <h1>API Test Page</h1>
    <p>This page is used to test the task API endpoints.</p>
    <TaskTest />
  </div>
</template>

<script setup>
// Page meta
definePageMeta({
  title: 'API Test'
})
</script>

<style scoped>
.test-page {
  padding: 20px;
  min-height: 100vh;
  background-color: #f8f9fa;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}

p {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}
</style>
