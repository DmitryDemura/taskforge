import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      },
    });

    // Invalidate cache
    await this.redis.del('tasks:all');

    return task;
  }

  async findAll(query: QueryTaskDto) {
    const { status, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Try to get from the cache first
    const cacheKey = `tasks:${JSON.stringify(query)}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    interface WhereClause {
      status?: string;
      OR?: Array<{
        title?: { contains: string };
        description?: { contains: string };
      }>;
    }

    const where: WhereClause = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    const result = {
      tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // Cache for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  async findOne(id: number) {
    const cacheKey = `task:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Cache for 10 minutes
    await this.redis.set(cacheKey, JSON.stringify(task), 600);

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        dueDate: updateTaskDto.dueDate
          ? new Date(updateTaskDto.dueDate)
          : undefined,
      },
    });

    // Invalidate cache
    await this.redis.del(`task:${id}`);
    await this.redis.del('tasks:all');

    return task;
  }

  async remove(id: number) {
    await this.prisma.task.delete({
      where: { id },
    });

    // Invalidate cache
    await this.redis.del(`task:${id}`);
    await this.redis.del('tasks:all');

    return { message: 'Task deleted successfully' };
  }
}
