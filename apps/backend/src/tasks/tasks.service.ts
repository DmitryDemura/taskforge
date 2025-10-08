import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus, Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';

type SortDir = 'asc' | 'desc';

export interface PaginatedTasks {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private addDays(d: Date, n: number): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  private buildDueDateFilter(input: string): Prisma.DateTimeNullableFilter | undefined {
    if (!input?.trim()) {
      return undefined;
    }

    if (input.includes('..')) {
      const [fromRaw, toRaw] = input.split('..').map((s) => s.trim());
      const from = new Date(fromRaw);
      const to = new Date(toRaw);

      if (!isNaN(from.getTime())) {
        const gte = this.startOfDay(from);
        const lt = !isNaN(to.getTime()) ? this.addDays(this.startOfDay(to), 1) : undefined;

        return lt ? { gte, lt } : { gte };
      }

      return undefined;
    }

    const d = new Date(input);

    if (isNaN(d.getTime())) {
      return undefined;
    }

    const gte = this.startOfDay(d);
    const lt = this.addDays(gte, 1);

    return { gte, lt };
  }

  private normalizeSortField(sortField?: string): keyof Prisma.TaskOrderByWithRelationInput {
    const allowed = ['id', 'title', 'status', 'dueDate', 'createdAt', 'updatedAt'] as const;

    type SortField = (typeof allowed)[number];

    const candidate: string = sortField ?? 'dueDate';

    return (allowed as readonly string[]).includes(candidate)
      ? (candidate as SortField)
      : 'dueDate';
  }

  async create(createTaskDto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      },
    });
    await this.invalidateTaskListCache();

    return task;
  }

  async findAll(query: QueryTaskDto): Promise<PaginatedTasks> {
    const { status, sort = 'asc', search, title, dueDate, sortField = 'dueDate' } = query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = query.skip ?? (page - 1) * limit;
    const take = query.take ?? limit;
    const cacheKey = `tasks:${JSON.stringify(query)}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as PaginatedTasks;
    }

    const where: Prisma.TaskWhereInput = {};

    if (status) {
      where.status = status as TaskStatus;
    }

    const dueDateFilter = dueDate ? this.buildDueDateFilter(dueDate) : undefined;

    if (dueDateFilter) {
      where.dueDate = dueDateFilter;
    }

    if (search?.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    } else {
      if (title?.trim()) {
        where.title = { contains: title, mode: 'insensitive' };
      }
    }

    const safeSortField = this.normalizeSortField(sortField);
    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [safeSortField]: (sort === 'asc' ? 'asc' : 'desc') as SortDir,
    };
    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({ where, skip, take, orderBy }),
      this.prisma.task.count({ where }),
    ]);
    const result: PaginatedTasks = {
      tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    await this.redis.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  async findOne(id: number): Promise<Task> {
    if (id === undefined || id === null || isNaN(id)) {
      throw new NotFoundException(`Invalid task ID: ${id}`);
    }

    const cacheKey = `task:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as Task;
    }

    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.redis.set(cacheKey, JSON.stringify(task), 600);

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        dueDate:
          updateTaskDto.dueDate !== undefined
            ? updateTaskDto.dueDate
              ? new Date(updateTaskDto.dueDate)
              : null
            : undefined,
      },
    });
    await this.redis.del(`task:${id}`);
    await this.invalidateTaskListCache();

    return task;
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.prisma.task.delete({ where: { id } });
    await this.redis.del(`task:${id}`);
    await this.invalidateTaskListCache();

    return { message: 'Task deleted successfully' };
  }

  private async invalidateTaskListCache(): Promise<void> {
    const keys = await this.redis.client.keys('tasks:*');

    if (keys.length > 0) {
      await this.redis.client.del(...keys);
    }
  }
}
