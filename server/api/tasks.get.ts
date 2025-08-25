import { sampleTasks } from "../data/sampleTasks";
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
