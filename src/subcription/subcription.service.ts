import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { CreateSubscriptionDto } from './DTO/subcriptionDto';
import { UpdateSubscriptionDto } from './DTO/updateSubcriptionDto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SubcriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly userService: UserService,
  ) {}
  async createSubscription(
    createSubscriptionDto: CreateSubscriptionDto,
    userId: string,
  ) {
    const { name, price, duration, description } = createSubscriptionDto;
    const newSubscription = this.subscriptionRepository.create({
      name,
      price,
      duration,
      description,
    });
    const user = await this.userService.findOneById(userId);
    if (user.role !== 'ADMIN') {
      throw new HttpException(
        { message: 'Bạn k có quyền tạo gói dịch vụ' },
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
    userId: string,
  ) {
    const { name, price, duration, description } = updateSubscriptionDto;
    const subscription = await this.subscriptionRepository.findOne({
      where: { subscriptionId: id },
    });
    const owner = await this.userService.findOneById(userId);
    if (!subscription) {
      throw new HttpException(
        { message: 'Không tìm thấy gói dịch vụ' },
        HttpStatus.NOT_FOUND,
      );
    }
    if (owner.role !== 'ADMIN') {
      throw new HttpException(
        { message: 'Bạn k có quyền cập nhật gói dịch vụ này' },
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
  async findAll() {
    try {
      const subscriptions = await this.subscriptionRepository.find();
      return subscriptions;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        { message: err.message || 'Error fetching subscriptions' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
