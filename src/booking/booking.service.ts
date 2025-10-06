import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Court } from 'src/court/entities/court.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { CreateBookingDto } from './DTO/create-booking.dto';
import { User } from 'src/user/entities/user.entity';
import { BookingStatus } from 'src/common/enum/BookingStatus';
// import { Role } from 'src/common/enum/Role';
import { CompleteBookingDto } from './DTO/complete-booking.dto';
import { PaymentStatus } from 'src/common/enum/PaymentStatus';
import { BookingInvitee } from 'src/booking-invitee/entities/booking-invitee.entity';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(Court) private courtRepository: Repository<Court>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @InjectRepository(BookingInvitee)
    private bookingInviteeRepository: Repository<BookingInvitee>,
    private dataSource: DataSource,
  ) {}

  // async createBooking(
  //   createBookingDto: CreateBookingDto,
  //   userId: string,
  // ): Promise<Booking> {
  //   const { courtId, startTime, endTime, inviteeIds, bookingDate } =
  //     createBookingDto;
  //   const user = await this.userRepository.findOneBy({ userId: userId });
  //   if (!user) {
  //     throw new HttpException(
  //       { message: 'User not found.' },
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  //   const court = await this.courtRepository.findOneBy({ courtId: courtId });
  //   if (!court) {
  //     throw new HttpException(
  //       { message: `Court with ID ${courtId} not found` },
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  //   const startDate = new Date(startTime);
  //   const endDate = new Date(endTime);
  //   const durationInHours = (endDate.getTime() - startDate.getTime()) / 3600000;

  //   const existingBooking = await this.bookingRepository
  //     .createQueryBuilder('booking')
  //     .where('booking.courtId = :courtId', { courtId })
  //     .andWhere(
  //       new Brackets((qb) => {
  //         qb.where('booking.status = :confirmed', {
  //           confirmed: BookingStatus.CONFIRMED,
  //         }).orWhere('booking.status = :pending', {
  //           pending: BookingStatus.PENDING_DEPOSIT,
  //         });
  //       }),
  //     )
  //     .andWhere(
  //       ':startTime < booking.endTime AND :endTime > booking.startTime',
  //       { startTime: startDate, endTime: endDate },
  //     )
  //     .getOne();

  //   if (existingBooking) {
  //     throw new HttpException(
  //       { message: 'The selected time slot is already booked or pending.' },
  //       HttpStatus.CONFLICT,
  //     );
  //   }
  //   if (durationInHours <= 0) {
  //     throw new HttpException(
  //       { message: 'End time must be after start time.' },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   const totalPrice = durationInHours * court.pricePerHour;
  //   const deposit = totalPrice * 0.2;

  //   // Dung transaction de dam bao tinh toan va luu tru du lieu dung dan
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     // 1. Tạo Booking chính
  //     const newBooking = queryRunner.manager.create(Booking, {
  //       court,
  //       user,
  //       startTime: startDate,
  //       endTime: endDate,
  //       totalPrice,
  //       deposit,
  //       status: BookingStatus.PENDING_DEPOSIT,
  //       bookingDate: bookingDate,
  //     });
  //     const savedBooking = await queryRunner.manager.save(newBooking);
  //     if (inviteeIds && inviteeIds.length > 0) {
  //       for (const inviteeId of inviteeIds) {
  //         if (inviteeId === user.userId) {
  //           throw new HttpException(
  //             { message: 'You cannot invite yourself.' },
  //             HttpStatus.BAD_REQUEST,
  //           );
  //         }
  //         const inviteeExists = await this.userRepository.findOneBy({
  //           userId: inviteeId,
  //         });
  //         if (!inviteeExists) {
  //           throw new HttpException(
  //             { message: `Invited user with ID ${inviteeId} not found.` },
  //             HttpStatus.NOT_FOUND,
  //           );
  //         }
  //         const newInvitee = queryRunner.manager.create(BookingInvitee, {
  //           booking: savedBooking,
  //           user: { userId: inviteeId } as User,
  //         });
  //         await queryRunner.manager.save(newInvitee);
  //       }
  //     }
  //     const depositPayment = queryRunner.manager.create(Payment, {
  //       amount: deposit,
  //       paymentMethod: 'Bank Transfer',
  //       paymentStatus: PaymentStatus.PENDING,
  //       booking: savedBooking,
  //       user: user,
  //       transactionCode: `DEP-${Date.now()}`,
  //     });
  //     await queryRunner.manager.save(depositPayment);
  //     await queryRunner.commitTransaction();
  //     return savedBooking;
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //     throw err;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  // async confirmBooking(bookingId: string, userId: string): Promise<Booking> {
  //   const currentUser = await this.userRepository.findOneBy({ userId });
  //   if (!currentUser) {
  //     throw new HttpException(
  //       { message: 'Current user not found.' },
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  //   const booking = await this.bookingRepository.findOne({
  //     where: { bookingId: bookingId },
  //     relations: ['user'],
  //   });

  //   if (!booking) {
  //     throw new HttpException(
  //       { message: `Booking with ID "${bookingId}" not found` },
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  //   if (
  //     booking.user.userId !== currentUser.userId &&
  //     currentUser.role !== 'OWNER' //Role.OWNER
  //   ) {
  //     throw new HttpException(
  //       { message: 'You do not have permission to confirm this booking.' },
  //       HttpStatus.FORBIDDEN,
  //     );
  //   }
  //   if (
  //     booking.status === 'PENDING_DEPOSIT' || //BookingStatus.PENDING_DEPOSIT
  //     booking.status === 'CANCELLED' //BookingStatus.CANCELLED
  //   ) {
  //     throw new HttpException(
  //       { message: 'This booking has already been confirmed or cancelled.' },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   const depositPayment = await this.paymentRepository.findOneBy({
  //     booking: { bookingId },
  //   });
  //   if (depositPayment) {
  //     depositPayment.paymentStatus = PaymentStatus.SUCCESS;
  //     await this.paymentRepository.save(depositPayment);
  //   }
  //   booking.status = BookingStatus.CONFIRMED;
  //   return this.bookingRepository.save(booking);
  // }

  // async completeBooking(
  //   bookingId: string,
  //   completeBookingDto: CompleteBookingDto,
  //   userId: string,
  // ): Promise<Booking> {
  //   const currentUser = await this.userRepository.findOneBy({ userId });
  //   if (!currentUser) {
  //     throw new HttpException(
  //       { message: 'Current user not found.' },
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  //   const booking = await this.bookingRepository.findOne({
  //     where: { bookingId },
  //     relations: ['court', 'court.owner'],
  //   });

  //   if (!booking) {
  //     throw new HttpException(
  //       { message: `Booking with ID "${bookingId}" not found` },
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  //   if (
  //     booking.court.owner.userId !== currentUser.userId && // Chủ sân
  //     currentUser.role !== 'OWNER' //Role.OWNER
  //   ) {
  //     throw new HttpException(
  //       { message: 'You do not have permission to complete this booking.' },
  //       HttpStatus.FORBIDDEN,
  //     );
  //   }
  //   if (booking.status !== 'CONFIRMED') {
  //     //BookingStatus.CONFIRMED
  //     throw new HttpException(
  //       {
  //         message: `Booking cannot be completed because its status is '${booking.status}'`,
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   const remainingAmount = booking.totalPrice - booking.deposit;
  //   const finalPayment = this.paymentRepository.create({
  //     amount: remainingAmount,
  //     paymentMethod: completeBookingDto.finalPaymentMethod,
  //     paymentStatus: PaymentStatus.SUCCESS,
  //     booking: booking,
  //     user: booking.user,
  //   });
  //   await this.paymentRepository.save(finalPayment);
  //   booking.status = BookingStatus.COMPLETED;
  //   return this.bookingRepository.save(booking);
  // }

  // async cancelBookingByUser(
  //   bookingId: string,
  //   userId: string,
  // ): Promise<Booking> {
  //   const currentUser = await this.userRepository.findOneBy({ userId });
  //   if (!currentUser) {
  //     throw new HttpException(
  //       { message: 'Current user not found.' },
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  //   const booking = await this.bookingRepository.findOne({
  //     where: { bookingId },
  //     relations: ['user'],
  //   });

  //   if (!booking) {
  //     throw new HttpException(
  //       {
  //         message: `Booking with ID "${bookingId}" not found`,
  //       },
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  //   if (booking.user.userId !== currentUser.userId) {
  //     throw new HttpException(
  //       {
  //         message: 'You can only cancel your own bookings.',
  //       },
  //       HttpStatus.FORBIDDEN,
  //     );
  //   }
  //   if (
  //     booking.status === 'COMPLETED' || //BookingStatus.COMPLETED
  //     booking.status === 'CANCELLED' //BookingStatus.CANCELLED
  //   ) {
  //     throw new HttpException(
  //       {
  //         message: `This booking cannot be cancelled as it is already '${booking.status}'.`,
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   booking.status = BookingStatus.CANCELLED;

  //   return this.bookingRepository.save(booking);
  // }

  // async getMyBookings(
  //   userId: string,
  //   options: IPaginationOptions,
  //   status?: BookingStatus,
  // ): Promise<Pagination<Booking>> {
  //   const queryBuilder = this.bookingRepository.createQueryBuilder('booking');

  //   queryBuilder
  //     .where('booking.userId = :userId', { userId: userId })
  //     .leftJoinAndSelect('booking.court', 'court')
  //     .orderBy('booking.bookingDate', 'DESC');

  //   if (status) {
  //     queryBuilder.andWhere('booking.status = :status', { status });
  //   }

  //   return paginate<Booking>(queryBuilder, options);
  // }
  // async getBookingsForCourtByOwner(
  //   courtId: string,
  //   currentUserId: string,
  //   options: IPaginationOptions,
  //   status?: BookingStatus,
  //   search?: string,
  // ): Promise<Pagination<Booking>> {
  //   const court = await this.courtRepository.findOne({
  //     where: { courtId: courtId },
  //     relations: ['owner'],
  //   });

  //   if (!court) {
  //     throw new HttpException(
  //       { message: `Court with ID "${courtId}" not found` },
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }

  //   if (court.owner.userId !== currentUserId) {
  //     throw new HttpException(
  //       {
  //         message:
  //           'You do not have permission to view bookings for this court.',
  //       },
  //       HttpStatus.FORBIDDEN,
  //     );
  //   }
  //   const queryBuilder = this.bookingRepository.createQueryBuilder('booking');
  //   queryBuilder
  //     .where('booking.courtId = :courtId', { courtId })
  //     .leftJoinAndSelect('booking.user', 'user')
  //     .orderBy('booking.startTime', 'DESC');

  //   if (status) {
  //     queryBuilder.andWhere('booking.status = :status', { status });
  //   }
  //   if (search) {
  //     queryBuilder.andWhere('user.fullName ILIKE :search', {
  //       search: `%${search}%`,
  //     });
  //   }

  //   return paginate<Booking>(queryBuilder, options);
  // }
}
