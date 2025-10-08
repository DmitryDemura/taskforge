import { Controller, Get } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(private readonly redis: RedisService) {}

  @Get()
  async check() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      storage: 'in-memory',
      redis: 'unknown',
    };

    // Check Redis connection
    try {
      await this.redis.ping();
      checks.redis = 'connected';
    } catch {
      checks.redis = 'disconnected';
      checks.status = 'error';
    }

    return checks;
  }
}
