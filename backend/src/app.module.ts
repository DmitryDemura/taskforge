import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [HealthModule, TasksModule, PrismaModule, RedisModule],
})
export class AppModule {}
