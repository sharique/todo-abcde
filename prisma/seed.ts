import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting to seed database...')

  // Clear existing data
  await prisma.task.deleteMany()

  // Create sample tasks
  const sampleTasks = [
    {
      title: 'Complete project documentation',
      deadline: new Date('2024-02-15T09:00:00Z'),
      status: 'todo',
      category: 'work'
    },
    {
      title: 'Review pull requests',
      deadline: new Date('2024-02-10T14:30:00Z'),
      status: 'in-progress',
      category: 'code-review'
    },
    {
      title: 'Fix authentication bug',
      deadline: new Date('2024-02-08T16:00:00Z'),
      status: 'completed',
      category: 'bug-fix'
    },
    {
      title: 'Update user interface design',
      deadline: new Date('2024-02-20T11:00:00Z'),
      status: 'todo',
      category: 'design'
    },
    {
      title: 'Write unit tests for API',
      deadline: new Date('2024-02-12T10:15:00Z'),
      status: 'in-progress',
      category: 'testing'
    },
    {
      title: 'Deploy to staging environment',
      deadline: new Date('2024-02-18T13:45:00Z'),
      status: 'todo',
      category: 'deployment'
    },
    {
      title: 'Database migration',
      deadline: new Date('2024-02-05T08:30:00Z'),
      status: 'completed',
      category: 'database'
    }
  ]

  for (const task of sampleTasks) {
    const createdTask = await prisma.task.create({
      data: task
    })
    console.log(`Created task: ${createdTask.title}`)
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
