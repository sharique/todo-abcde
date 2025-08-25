import fs from "fs/promises";
import path from "path";

export default defineEventHandler(async (event) => {
  try {
    // Get task ID from route parameter
    const taskId = getRouterParam(event, 'id');

    if (!taskId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Task ID is required",
      });
    }

    // Convert to number for comparison
    const id = parseInt(taskId);
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Task ID must be a valid number",
      });
    }

    // Read current tasks from file
    const dataFilePath = path.resolve(
      process.cwd(),
      "server/data/sampleTasks.ts",
    );

    const currentFileContent = await fs.readFile(dataFilePath, "utf8");

    // Extract current tasks array from file content
    const arrayMatch = currentFileContent.match(
      /export const sampleTasks = (\[[\s\S]*?\]);/,
    );
    let currentTasks = [];

    if (arrayMatch) {
      try {
        currentTasks = JSON.parse(arrayMatch[1]);
      } catch (e) {
        console.error("Failed to parse existing tasks:", e);
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to parse tasks data",
        });
      }
    }

    // Find task index
    const taskIndex = currentTasks.findIndex((task: any) => task.id === id);

    if (taskIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: "Task not found",
      });
    }

    // Remove task from array
    const deletedTask = currentTasks.splice(taskIndex, 1)[0];

    // Save updated tasks to file
    const fileContent = `// Sample initial data
export const sampleTasks = ${JSON.stringify(currentTasks, null, 2)};
`;

    await fs.writeFile(dataFilePath, fileContent, "utf8");

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    console.log("Task deleted successfully:", deletedTask);
    return {
      data: deletedTask,
      success: true,
      message: "Task deleted successfully",
    };
  } catch (error: any) {
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }

    // Otherwise, create a generic server error
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error while deleting task",
    });
  }
});
