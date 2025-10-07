import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private _client: Redis;

  get client(): Redis {
    return this._client;
  }

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL;

    if (redisUrl) {
      this._client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
      });
    } else {
      this._client = new Redis({
        host: process.env.REDIS_HOST ?? 'redis',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
        maxRetriesPerRequest: 3,
      });
    }

    this._client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
  }

  async get(key: string): Promise<string | null> {
    return this._client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this._client.setex(key, ttl, value);
    } else {
      await this._client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this._client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this._client.exists(key)) === 1;
  }

  async ping(): Promise<string> {
    return this._client.ping();
  }
}
