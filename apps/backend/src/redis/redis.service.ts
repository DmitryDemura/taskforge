import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import Redis from 'ioredis';

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<string>;
  setex(key: string, ttl: number, value: string): Promise<string>;
  del(...keys: string[]): Promise<number>;
  exists(key: string): Promise<number>;
  ping(): Promise<string>;
  keys(pattern: string): Promise<string[]>;
  connect?(): Promise<void>;
  disconnect(): Promise<void> | void;
  quit?(): Promise<void>;
  on(event: 'error', listener: (err: Error) => void): unknown;
  removeListener(event: 'error', listener: (err: Error) => void): unknown;
}

class InMemoryRedisClient extends EventEmitter implements RedisClient {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async connect(): Promise<void> {
    // no-op for in-memory client
  }

  async disconnect(): Promise<void> {
    // no-op for in-memory client
  }

  async quit(): Promise<void> {
    // no-op for in-memory client
  }

  async get(key: string): Promise<string | null> {
    this.evictIfExpired(key);
    const entry = this.store.get(key);

    return entry ? entry.value : null;
  }

  async set(key: string, value: string): Promise<string> {
    this.store.set(key, { value });

    return 'OK';
  }

  async setex(key: string, ttl: number, value: string): Promise<string> {
    const expiresAt = Date.now() + ttl * 1000;
    this.store.set(key, { value, expiresAt });

    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let removed = 0;

    for (const key of keys) {
      if (this.store.delete(key)) {
        removed += 1;
      }
    }

    return removed;
  }

  async exists(key: string): Promise<number> {
    this.evictIfExpired(key);

    return this.store.has(key) ? 1 : 0;
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async keys(pattern: string): Promise<string[]> {
    this.pruneExpired();
    const regex = this.patternToRegex(pattern);

    return Array.from(this.store.keys()).filter((key) => regex.test(key));
  }

  private pruneExpired(): void {
    const now = Date.now();

    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        this.store.delete(key);
      }
    }
  }

  private evictIfExpired(key: string): void {
    const entry = this.store.get(key);

    if (entry?.expiresAt && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
    }
  }

  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
    const wildcard = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');

    return new RegExp(`^${wildcard}$`);
  }
}

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private _client: RedisClient;

  get client(): RedisClient {
    return this._client;
  }

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL;

    const client = redisUrl
      ? await this.tryConnectWithUrl(redisUrl)
      : await this.tryConnectWithHosts();

    if (client) {
      this.registerErrorHandler(client);
      this._client = client;
      this.logger.log('Connected to Redis cache');

      return;
    }

    this.logger.warn(
      'Redis connection failed; falling back to in-memory cache. Cached data will not persist across restarts.',
    );
    this._client = new InMemoryRedisClient();
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

  private registerErrorHandler(client: RedisClient): void {
    client.on('error', (err) => {
      this.logger.error(`Redis Client Error: ${err.message}`, err.stack);
    });
  }

  private async tryConnectWithUrl(redisUrl: string): Promise<RedisClient | null> {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    const silentHandler = (error: Error) =>
      this.logger.debug(`Redis connection error for URL ${redisUrl}: ${error.message}`);

    client.on('error', silentHandler);

    try {
      await client.connect();
      client.removeListener('error', silentHandler);

      return client as unknown as RedisClient;
    } catch (error) {
      client.removeListener('error', silentHandler);
      await client.disconnect();
      this.logger.warn(
        `Failed to connect to Redis via URL ${redisUrl}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );

      return null;
    }
  }

  private async tryConnectWithHosts(): Promise<RedisClient | null> {
    const port = parseInt(process.env.REDIS_PORT ?? '6379', 10);
    const hostCandidates = process.env.REDIS_HOST
      ? [process.env.REDIS_HOST]
      : ['127.0.0.1', 'localhost', 'redis'];

    for (const host of hostCandidates) {
      const candidate = new Redis({
        host,
        port,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
      const silentHandler = (error: Error) =>
        this.logger.debug(`Redis connection error for host ${host}:${port} - ${error.message}`);

      candidate.on('error', silentHandler);

      try {
        await candidate.connect();
        candidate.removeListener('error', silentHandler);

        return candidate as unknown as RedisClient;
      } catch (error) {
        candidate.removeListener('error', silentHandler);
        await candidate.disconnect();
        this.logger.warn(
          `Failed to connect to Redis at ${host}:${port} - ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        );
      }
    }

    return null;
  }
}
