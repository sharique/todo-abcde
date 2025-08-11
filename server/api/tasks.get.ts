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
export default defineEventHandler(async (event) => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return tasks in the expected format
    return {
      data: sampleTasks,
      success: true,
      message: "Tasks loaded successfully",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to load tasks",
    });
  }
});
