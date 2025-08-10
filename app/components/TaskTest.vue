<template>
  <div class="task-test-container">
    <h2>Task API Test Component</h2>

    <div class="test-controls">
      <button @click="fetchTasks" :disabled="loading" class="fetch-btn">
        {{ loading ? 'Loading...' : 'Fetch All Tasks' }}
      </button>
      <button @click="clearResults" class="clear-btn">Clear Results</button>
    </div>

    <div v-if="error" class="error">
      <h3>Error:</h3>
      <p>{{ error }}</p>
    </div>

    <div v-if="apiResponse" class="results">
      <h3>API Response:</h3>
      <div class="response-info">
        <p><strong>Success:</strong> {{ apiResponse.success }}</p>
        <p><strong>Total Tasks:</strong> {{ apiResponse.count }}</p>
      </div>

      <div v-if="apiResponse.data && apiResponse.data.length > 0" class="tasks-list">
        <h4>Tasks:</h4>
        <div v-for="task in apiResponse.data" :key="task.id" class="task-item">
          <div class="task-header">
            <span class="task-id">#{{ task.id }}</span>
            <span class="task-status" :class="task.status">{{ task.status }}</span>
          </div>
          <h5>{{ task.title }}</h5>
          <div class="task-details">
            <p><strong>Category:</strong> {{ task.category }}</p>
            <p><strong>Deadline:</strong> {{ formatDate(task.deadline) }}</p>
          </div>
        </div>
      </div>

      <div v-else class="no-tasks">
        <p>No tasks found in the database.</p>
      </div>
    </div>

    <div v-if="rawResponse" class="raw-response">
      <h3>Raw JSON Response:</h3>
      <pre>{{ JSON.stringify(rawResponse, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)
const error = ref(null)
const apiResponse = ref(null)
const rawResponse = ref(null)

const fetchTasks = async () => {
  loading.value = true
  error.value = null
  apiResponse.value = null
  rawResponse.value = null

  try {
    const response = await $fetch('/api/tasks')

    apiResponse.value = response
    rawResponse.value = response

    console.log('Tasks fetched successfully:', response)
  } catch (err) {
    error.value = err.message || 'Failed to fetch tasks'
    console.error('Error fetching tasks:', err)
  } finally {
    loading.value = false
  }
}

const clearResults = () => {
  apiResponse.value = null
  rawResponse.value = null
  error.value = null
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}
</script>

<style scoped>
.task-test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2 {
  color: #333;
  text-align: center;
  margin-bottom: 20px;
}

.test-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.fetch-btn, .clear-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.fetch-btn {
  background-color: #007bff;
  color: white;
}

.fetch-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.fetch-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.clear-btn {
  background-color: #6c757d;
  color: white;
}

.clear-btn:hover {
  background-color: #545b62;
}

.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.results {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.response-info {
  margin-bottom: 15px;
}

.response-info p {
  margin: 5px 0;
}

.tasks-list {
  margin-top: 15px;
}

.task-item {
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 10px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.task-id {
  font-weight: bold;
  color: #666;
}

.task-status {
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.task-status.todo {
  background-color: #ffeaa7;
  color: #fdcb6e;
}

.task-status.in-progress {
  background-color: #74b9ff;
  color: white;
}

.task-status.completed {
  background-color: #00b894;
  color: white;
}

.task-item h5 {
  margin: 0 0 10px 0;
  color: #333;
}

.task-details p {
  margin: 3px 0;
  font-size: 14px;
  color: #666;
}

.no-tasks {
  text-align: center;
  color: #666;
  font-style: italic;
}

.raw-response {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  padding: 15px;
}

.raw-response pre {
  background-color: #f8f9fa;
  border: none;
  padding: 0;
  margin: 0;
  font-size: 12px;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
