import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { CreateSubscriptionDto } from './DTO/subcriptionDto';
import { User } from 'src/user/entities/user.entity';
import { UpdateSubscriptionDto } from './DTO/updateSubcriptionDto';

@Injectable()
export class SubcriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}
  async createSubscription(
    createSubscriptionDto: CreateSubscriptionDto,
    owner: User,
  ) {
    const { name, price, duration, description } = createSubscriptionDto;
    const newSubscription = this.subscriptionRepository.create({
      name,
      price,
      duration,
      description,
    });
    if (owner.role !== 'ADMIN') {
      throw new HttpException(
        { message: "You don't have permission to create a subscription" },
        HttpStatus.FORBIDDEN,
      );
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
  async updateSubscription(
    id: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
    owner: User,
  ) {
    const { name, price, duration, description } = updateSubscriptionDto;
    const subscription = await this.subscriptionRepository.findOne({
      where: { subscriptionId: id },
    });
    if (!subscription) {
      throw new HttpException(
        { message: 'Subscription not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    if (owner.role !== 'ADMIN') {
      throw new HttpException(
        { message: "You don't have permission to update this subscription" },
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      subscription.name = name;
      subscription.price = price;
      subscription.duration = duration;
      subscription.description = description;
      const result = await this.subscriptionRepository.save(subscription);
      return result;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        { message: err.message || 'Error updating subscription' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
