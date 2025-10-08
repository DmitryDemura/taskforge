import { PrismaClient, Prisma } from '@prisma/client';
import { TaskStatus } from '../src/tasks/task-status.enum';
import { toPrismaTaskStatus } from '../src/tasks/task-status.mapper';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.task.count();

  if (count > 0) {
    console.info(`Seed skipped: ${count} tasks already exist.`);

    return;
  }

  const today = new Date();

  await prisma.task.createMany({
    data: [
      {
        title: 'Plan project structure',
        description: 'Define modules and shared conventions',
        status: toPrismaTaskStatus(TaskStatus.todo) as Prisma.TaskStatus,
      },
      {
        title: 'Implement Tasks API',
        description: 'CRUD with Prisma and NestJS',
        status: toPrismaTaskStatus(TaskStatus.in_progress) as Prisma.TaskStatus,
      },
      {
        title: 'Wire up Frontend',
        description: 'Nuxt UI with PrimeVue',
        status: toPrismaTaskStatus(TaskStatus.done) as Prisma.TaskStatus,
        dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.info('Seed completed: created demo tasks.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
