import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  // Basic key-value operations
  async set(key: string, value: string | number | object, ttl?: number): Promise<void> {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      if (ttl) {
        await this.redis.setex(key, ttl, stringValue);
      } else {
        await this.redis.set(key, stringValue);
      }
      this.logger.debug(`Set key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to set key ${key}:`, error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const value = await this.redis.get(key);
      this.logger.debug(`Get key: ${key}, found: ${!!value}`);
      return value;
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error);
      throw error;
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Failed to get JSON for key ${key}:`, error);
      return null;
    }
  }

  async del(key: string): Promise<number> {
    try {
      const result = await this.redis.del(key);
      this.logger.debug(`Deleted key: ${key}, result: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}:`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence of key ${key}:`, error);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(key, seconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to set expiration for key ${key}:`, error);
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error(`Failed to get TTL for key ${key}:`, error);
      throw error;
    }
  }

  // Hash operations
  async hset(key: string, field: string, value: string | number): Promise<number> {
    try {
      return await this.redis.hset(key, field, String(value));
    } catch (error) {
      this.logger.error(`Failed to set hash field ${field} in key ${key}:`, error);
      throw error;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.redis.hget(key, field);
    } catch (error) {
      this.logger.error(`Failed to get hash field ${field} from key ${key}:`, error);
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.redis.hgetall(key);
    } catch (error) {
      this.logger.error(`Failed to get all hash fields from key ${key}:`, error);
      throw error;
    }
  }

  async hdel(key: string, field: string): Promise<number> {
    try {
      return await this.redis.hdel(key, field);
    } catch (error) {
      this.logger.error(`Failed to delete hash field ${field} from key ${key}:`, error);
      throw error;
    }
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.redis.lpush(key, ...values);
    } catch (error) {
      this.logger.error(`Failed to push to list ${key}:`, error);
      throw error;
    }
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.redis.rpush(key, ...values);
    } catch (error) {
      this.logger.error(`Failed to push to list ${key}:`, error);
      throw error;
    }
  }

  async lpop(key: string): Promise<string | null> {
    try {
      return await this.redis.lpop(key);
    } catch (error) {
      this.logger.error(`Failed to pop from list ${key}:`, error);
      throw error;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.redis.rpop(key);
    } catch (error) {
      this.logger.error(`Failed to pop from list ${key}:`, error);
      throw error;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.redis.lrange(key, start, stop);
    } catch (error) {
      this.logger.error(`Failed to get range from list ${key}:`, error);
      throw error;
    }
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.sadd(key, ...members);
    } catch (error) {
      this.logger.error(`Failed to add to set ${key}:`, error);
      throw error;
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.srem(key, ...members);
    } catch (error) {
      this.logger.error(`Failed to remove from set ${key}:`, error);
      throw error;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key);
    } catch (error) {
      this.logger.error(`Failed to get members from set ${key}:`, error);
      throw error;
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.redis.sismember(key, member);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check membership in set ${key}:`, error);
      throw error;
    }
  }

  // Cache operations with automatic JSON serialization
  async setCache<T>(key: string, value: Partial<T>, ttl: number = 3600): Promise<void> {
    await this.set(key, value, ttl);
  }

  async getCache<T>(key: string): Promise<T | null> {
    return await this.getJson<T>(key);
  }

  async delCache(key: string): Promise<number> {
    return await this.del(key);
  }

  // Session operations
  async setSession(sessionId: string, data: object, ttl: number = 3600): Promise<void> {
    await this.setCache(`session:${sessionId}`, data, ttl);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    return await this.getCache<T>(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<number> {
    return await this.delCache(`session:${sessionId}`);
  }

  // OTP operations
  async setOtp(email: string, otp: string, ttl: number = 300): Promise<void> {
    await this.set(`otp:${email}`, otp, ttl);
  }

  async getOtp(email: string): Promise<string | null> {
    return await this.get(`otp:${email}`);
  }

  async deleteOtp(email: string): Promise<number> {
    return await this.del(`otp:${email}`);
  }

  // Rate limiting
  async incrementCounter(key: string, ttl: number = 3600): Promise<number> {
    try {
      const multi = this.redis.multi();
      multi.incr(key);
      multi.expire(key, ttl);
      const results = await multi.exec();
      return (results?.[0]?.[1] as number) || 0;
    } catch (error) {
      this.logger.error(`Failed to increment counter ${key}:`, error);
      throw error;
    }
  }

  // Pattern matching
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      this.logger.error(`Failed to get keys with pattern ${pattern}:`, error);
      throw error;
    }
  }

  // Pipeline operations for batch processing
  async pipeline(commands: Array<[string, ...any[]]>): Promise<any[]> {
    try {
      const pipeline = this.redis.pipeline();
      commands.forEach(([command, ...args]) => {
        (pipeline as any)[command](...args);
      });
      const results = await pipeline.exec();
      return results?.map(result => result[1]) || [];
    } catch (error) {
      this.logger.error('Failed to execute pipeline:', error);
      throw error;
    }
  }

  // Health check
  async ping(): Promise<string> {
    try {
      return await this.redis.ping();
    } catch (error) {
      this.logger.error('Redis ping failed:', error);
      throw error;
    }
  }

  // Get Redis info
  async info(): Promise<string> {
    try {
      return await this.redis.info();
    } catch (error) {
      this.logger.error('Failed to get Redis info:', error);
      throw error;
    }
  }
}
