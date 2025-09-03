import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { CreateSubscriptionDto } from './DTO/subcriptionDto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class SubcriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}
  async createSubscription(createSubscriptionDto: CreateSubscriptionDto,
    owner: User
  ) {
    const { name, price, duration, description } = createSubscriptionDto;
    const newSubscription = this.subscriptionRepository.create({
      name,
      price,
      duration,
      description,
    });
    if(owner.role !== 'ADMIN'){
      throw new HttpException({ message: 'You don\'t have permission to create a subscription' }, HttpStatus.FORBIDDEN);
    }
    try {
      const result = await this.subscriptionRepository.save(newSubscription);
      return result;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        { message: err.message || 'Error creating subscription' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
