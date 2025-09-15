import { TaskStatus as PrismaTaskStatus } from '@prisma/client';
import { TaskStatus } from './task-status.enum';

export function toPrismaTaskStatus(s?: TaskStatus): PrismaTaskStatus | undefined {
  return s as unknown as PrismaTaskStatus | undefined;
}

export function fromPrismaTaskStatus(s?: PrismaTaskStatus): TaskStatus | undefined {
  return s as unknown as TaskStatus | undefined;
}
