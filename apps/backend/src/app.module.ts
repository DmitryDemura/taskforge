import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { TasksModule } from './tasks/tasks.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [HealthModule, TasksModule, RedisModule],
})
export class AppModule {}
