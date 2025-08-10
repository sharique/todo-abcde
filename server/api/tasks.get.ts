import { PrismaClient } from "~/generated/prisma";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        deadline: "asc",
      },
    });

    return {
      success: true,
      data: tasks,
      count: tasks.length,
    };
  } catch (error) {
    console.error("Error fetching tasks:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch tasks",
    });
  }
});
