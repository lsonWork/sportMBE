import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL!);
    // this.client = new Redis({
    //   host: process.env.REDIS_HOST || 'redis',
    //   port: parseInt(process.env.REDIS_PORT || '1111', 10),
    // });

    this.client.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
    console.log('🔗 Redis URL:', process.env.REDIS_URL);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    console.log('👉 Redis client type:', this.client.constructor.name);
    console.log('👉 Redis client options:', this.client['options']);
    return this.client;
  }
}
