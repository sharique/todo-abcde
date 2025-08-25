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

    // Get the request body
    const body = await readBody(event);

    // Validate request body
    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: "Request body is required",
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

    // Get the existing task
    const existingTask = currentTasks[taskIndex];

    // Create updated task with validation
    const updatedTask = { ...existingTask };

    // Update title if provided
    if (body.title !== undefined) {
      if (typeof body.title !== "string" || body.title.trim() === "") {
        throw createError({
          statusCode: 400,
          statusMessage: "Title must be a non-empty string",
        });
      }
      updatedTask.title = body.title.trim();
    }

    // Update status if provided
    if (body.status !== undefined) {
      if (!["todo", "in progress", "completed"].includes(body.status)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Status must be one of: todo, in progress, completed",
        });
      }
      updatedTask.status = body.status;
    }

    // Update category if provided
    if (body.category !== undefined) {
      if (!["a", "b", "c", "d", "e"].includes(body.category)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Category must be one of: a, b, c, d, e",
        });
      }
      updatedTask.category = body.category;
    }

    // Update deadline if provided
    if (body.deadline !== undefined) {
      if (body.deadline !== null && !/^\d{4}-\d{2}-\d{2}$/.test(body.deadline)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Deadline must be null or in YYYY-MM-DD format",
        });
      }
      updatedTask.deadline = body.deadline;
    }

    // Update the task in the array
    currentTasks[taskIndex] = updatedTask;

    // Save updated tasks to file
    const fileContent = `// Sample initial data
export const sampleTasks = ${JSON.stringify(currentTasks, null, 2)};
`;

    await fs.writeFile(dataFilePath, fileContent, "utf8");

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    console.log("Task updated successfully:", updatedTask);
    return {
      data: updatedTask,
      success: true,
      message: "Task updated successfully",
    };
  } catch (error: any) {
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }

    // Otherwise, create a generic server error
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error while updating task",
    });
  }
});
