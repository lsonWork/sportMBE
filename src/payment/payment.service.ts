import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { PaymentStatus } from 'src/common/enum/PaymentStatus';
import { Court } from 'src/court/entities/court.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Court) private courtRepository: Repository<Court>,
  ) {}

  async getMyPayments(
    currentUserId: string,
    options: IPaginationOptions,
    status?: PaymentStatus,
  ): Promise<Pagination<Payment>> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    queryBuilder
      .where('payment.userId = :userId', { userId: currentUserId })
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('booking.court', 'court')
      .orderBy('payment.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('payment.paymentStatus = :status', {
        status: status,
      });
    }

    return paginate<Payment>(queryBuilder, options);
  }

  async getPaymentsForCourt(
    courtId: string,
    currentUserId: string,
    options: IPaginationOptions,
    status?: PaymentStatus,
  ): Promise<Pagination<Payment>> {
    const court = await this.courtRepository.findOne({
      where: { courtId: courtId },
      relations: ['owner'],
    });

    if (!court) {
      throw new HttpException(
        { message: `Court with ID "${courtId}" not found` },
        HttpStatus.NOT_FOUND,
      );
    }

    if (court.owner.userId !== currentUserId) {
      throw new HttpException(
        {
          message:
            'You do not have permission to view payments for this court.',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    queryBuilder
      .innerJoin('payment.booking', 'booking')
      .leftJoinAndSelect('payment.user', 'user')
      .where('booking.courtId = :courtId', { courtId })
      .orderBy('payment.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('payment.paymentStatus = :status', {
        status: status,
      });
    }

    return paginate<Payment>(queryBuilder, options);
  }
}
