import { Injectable } from '@nestjs/common';
import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  async getHello(): Promise<string> {
    const redis = this.redisService.getClient();

    // Kiểm tra cache
    const cached = await redis.get('hello');
    if (cached) {
      return `From cache: ${cached}`;
    }

    // Nếu chưa có cache, set vào Redis
    const result = 'Hello World!';
    await redis.set('hello', result, 'EX', 60); // expire sau 60 giây
    return `From DB: ${result}`;
  }
}
