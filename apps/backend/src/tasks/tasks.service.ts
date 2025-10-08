import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { TaskStatus } from './task-status.enum';
import { TaskEntity } from './task.entity';

type SortDir = 'asc' | 'desc';

export interface PaginatedTasks {
  tasks: TaskEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type SortField = 'id' | 'title' | 'status' | 'dueDate' | 'createdAt' | 'updatedAt';

interface DateRange {
  gte?: Date;
  lt?: Date;
}

type CachedTask = Omit<TaskEntity, 'dueDate' | 'createdAt' | 'updatedAt'> & {
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type CachedPaginatedTasks = Omit<PaginatedTasks, 'tasks'> & { tasks: CachedTask[] };

@Injectable()
export class TasksService {
  private tasks: TaskEntity[] = [];
  private nextId = 1;

  constructor(private redis: RedisService) {}

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private addDays(d: Date, n: number): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  private buildDueDateFilter(input: string): DateRange | undefined {
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

  private normalizeSortField(sortField?: string): SortField {
    const allowed: SortField[] = ['id', 'title', 'status', 'dueDate', 'createdAt', 'updatedAt'];

    const candidate = sortField ?? 'dueDate';

    return allowed.includes(candidate as SortField) ? (candidate as SortField) : 'dueDate';
  }

  private compareTasks(a: TaskEntity, b: TaskEntity, field: SortField, direction: SortDir): number {
    const multiplier = direction === 'asc' ? 1 : -1;

    switch (field) {
      case 'id':
        return (a.id - b.id) * multiplier;
      case 'title':
        return a.title.localeCompare(b.title) * multiplier;
      case 'status':
        return a.status.localeCompare(b.status) * multiplier;
      case 'dueDate': {
        const aValue = a.dueDate ? a.dueDate.getTime() : Number.MAX_SAFE_INTEGER;
        const bValue = b.dueDate ? b.dueDate.getTime() : Number.MAX_SAFE_INTEGER;

        return (aValue - bValue) * multiplier;
      }
      case 'createdAt':
      case 'updatedAt': {
        const aValue = a[field].getTime();
        const bValue = b[field].getTime();

        return (aValue - bValue) * multiplier;
      }
      default:
        return 0;
    }
  }

  private toCachedTask(task: TaskEntity): CachedTask {
    return {
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  private fromCachedTask(task: CachedTask): TaskEntity {
    return {
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    };
  }

  private async cacheTask(key: string, task: TaskEntity, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(this.toCachedTask(task)), ttlSeconds);
  }

  private async cacheTaskList(
    key: string,
    result: PaginatedTasks,
    ttlSeconds: number,
  ): Promise<void> {
    const payload: CachedPaginatedTasks = {
      ...result,
      tasks: result.tasks.map((task) => this.toCachedTask(task)),
    };
    await this.redis.set(key, JSON.stringify(payload), ttlSeconds);
  }

  async create(createTaskDto: CreateTaskDto): Promise<TaskEntity> {
    const now = new Date();
    const task: TaskEntity = {
      id: this.nextId++,
      title: createTaskDto.title,
      description: createTaskDto.description ?? null,
      status: createTaskDto.status ?? TaskStatus.todo,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.push(task);
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
      const parsed = JSON.parse(cached) as CachedPaginatedTasks;

      return {
        ...parsed,
        tasks: parsed.tasks.map((task) => this.fromCachedTask(task)),
      };
    }

    let filtered = [...this.tasks];

    if (status) {
      filtered = filtered.filter((task) => task.status === status);
    }

    const dueDateFilter = dueDate ? this.buildDueDateFilter(dueDate) : undefined;

    if (dueDateFilter) {
      filtered = filtered.filter((task) => {
        if (!task.dueDate) {
          return false;
        }

        const timestamp = task.dueDate.getTime();

        if (dueDateFilter.gte && timestamp < dueDateFilter.gte.getTime()) {
          return false;
        }

        return !(dueDateFilter.lt && timestamp >= dueDateFilter.lt.getTime());
      });
    }

    if (search?.trim()) {
      const searchLower = search.trim().toLowerCase();
      filtered = filtered.filter((task) => {
        const inTitle = task.title.toLowerCase().includes(searchLower);
        const inDesc = task.description?.toLowerCase().includes(searchLower) ?? false;

        return inTitle || inDesc;
      });
    } else {
      if (title?.trim()) {
        const titleLower = title.trim().toLowerCase();
        filtered = filtered.filter((task) => task.title.toLowerCase().includes(titleLower));
      }
    }

    const safeSortField = this.normalizeSortField(sortField);
    filtered.sort((a, b) =>
      this.compareTasks(a, b, safeSortField, sort === 'asc' ? 'asc' : 'desc'),
    );

    const total = filtered.length;
    const tasks = filtered.slice(skip, skip + take);
    const result: PaginatedTasks = {
      tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    await this.cacheTaskList(cacheKey, result, 300);

    return result;
  }

  async findOne(id: number): Promise<TaskEntity> {
    if (id === undefined || id === null || isNaN(id)) {
      throw new NotFoundException(`Invalid task ID: ${id}`);
    }

    const cacheKey = `task:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return this.fromCachedTask(JSON.parse(cached) as CachedTask);
    }

    const task = this.tasks.find((t) => t.id === id);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.cacheTask(cacheKey, task, 600);

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<TaskEntity> {
    const task = this.tasks.find((t) => t.id === id);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }

    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description ?? null;
    }

    if (updateTaskDto.status !== undefined) {
      task.status = updateTaskDto.status;
    }

    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null;
    }

    task.updatedAt = new Date();

    await this.redis.del(`task:${id}`);
    await this.invalidateTaskListCache();

    return task;
  }

  async remove(id: number): Promise<{ message: string }> {
    const index = this.tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    this.tasks.splice(index, 1);
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
