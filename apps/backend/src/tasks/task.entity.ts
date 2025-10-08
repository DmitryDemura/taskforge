import { TaskStatus } from './task-status.enum';

export interface TaskEntity {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
