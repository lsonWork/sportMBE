import { Injectable } from '@nestjs/common';
// import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService {
  // constructor(private readonly redisService: RedisService) {}

  getHello(): string {
    // const redis = this.redisService.getClient();

    // // Kiểm tra cache
    // const cached = await redis.get('yongseoh');
    // if (cached) {
    //   return `From cache: ${cached}`;
    // }

    // // Nếu chưa có cache, set vào Redis
    // const result = 'yongseoh!';
    // await redis.set('yongseoh', result, 'EX', 10); // expire sau 60 giây
    // return `From DB: ${result}`;
    return 'Hello World!';
  }
}
