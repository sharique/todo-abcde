export default defineEventHandler(async (event) => {
  try {
    // Get the request body
    const body = await readBody(event);

    // Validate required fields
    if (!body.title || typeof body.title !== "string") {
      throw createError({
        statusCode: 400,
        statusMessage: "Title is required and must be a string",
      });
    }

    if (!body.category || !["a", "b", "c", "d", "e"].includes(body.category)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Category must be one of: a, b, c, d, e",
      });
    }

    // Create new task with default values
    const newTask = {
      id: body.id || Date.now(),
      title: body.title.trim(),
      status: body.status || "todo",
      category: body.category,
      deadline: body.deadline || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Validate status
    if (!["todo", "in progress", "completed"].includes(newTask.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Status must be one of: todo, in progress, completed",
      });
    }

    // Validate deadline format if provided
    if (newTask.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(newTask.deadline)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Deadline must be in YYYY-MM-DD format",
      });
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // TODO: In a real application, you would save this to a database
    // For now, we'll just return the created task
    console.log("Task created successfully");
    return {
      data: newTask,
      success: true,
      message: "Task created successfully",
    };
  } catch (error: any) {
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }

    // Otherwise, create a generic server error
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error while creating task",
    });
  }
});
