import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Court } from 'src/court/entities/court.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { CreateBookingDto } from './DTO/create-booking.dto';
import { User } from 'src/user/entities/user.entity';
import { BookingStatus } from 'src/common/enum/BookingStatus';
// import { Role } from 'src/common/enum/Role';
import { PaymentStatus } from 'src/common/enum/PaymentStatus';
import { BookingInvitee } from 'src/booking-invitee/entities/booking-invitee.entity';
import { BookingOrder } from './entities/booking-order.entity';
import { PaymentMethod } from 'src/common/enum/PaymentMethod';

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

  async createBooking(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<BookingOrder> {
    const { courtId, selections, inviteeIds } = createBookingDto;
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) {
      throw new HttpException(
        `Không tìm thấy người dùng với ID ${userId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    const court = await this.courtRepository.findOneBy({ courtId });
    if (!court) {
      throw new HttpException(
        `Không tìm thấy sân với ID ${courtId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const slotsToBook: { startTime: Date; endTime: Date }[] = [];

      // 1. Chuẩn bị tất cả các slot cần đặt từ DTO
      for (const selection of selections) {
        const date = selection.date;
        const allSlotIds = [...selection.am.slotIds, ...selection.pm.slotIds];
        for (const slotId of allSlotIds) {
          const startHour = parseInt(slotId.substring(5, 7));
          const startTime = new Date(date);
          startTime.setUTCHours(startHour, 0, 0, 0);
          const endTime = new Date(date);
          endTime.setUTCHours(startHour + 1, 0, 0, 0);
          slotsToBook.push({ startTime, endTime });
        }
      }

      if (slotsToBook.length === 0) {
        throw new HttpException(
          'Bạn chưa chọn khung giờ nào.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 2. Kiểm tra xung đột cho tất cả các slot trong một lần query
      const existingBookings = await queryRunner.manager.find(Booking, {
        where: slotsToBook.map((slot) => ({
          court: { courtId },
          startTime: slot.startTime,
          status: In([BookingStatus.CONFIRMED, BookingStatus.PENDING_DEPOSIT]),
        })),
      });
      if (existingBookings.length > 0) {
        throw new HttpException(
          'Một hoặc nhiều khung giờ bạn chọn đã được đặt.',
          HttpStatus.CONFLICT,
        );
      }

      // 3. Tính toán tổng tiền và tạo BookingOrder (Đơn hàng tổng)
      const totalBookingPrice = slotsToBook.length * court.pricePerHour;
      const totalDeposit = totalBookingPrice * 0.2;

      const newOrder = queryRunner.manager.create(BookingOrder, {
        user,
        totalPrice: totalBookingPrice,
        totalDeposit,
        status: BookingStatus.PENDING_DEPOSIT,
      });
      const savedOrder = await queryRunner.manager.save(newOrder);

      // 4. Tạo các Booking con (các slot) thuộc về BookingOrder
      const bookingsToCreate = slotsToBook.map((slot) => {
        return queryRunner.manager.create(Booking, {
          court,
          user,
          startTime: slot.startTime,
          endTime: slot.endTime,
          totalPrice: court.pricePerHour,
          deposit: court.pricePerHour * 0.2,
          status: BookingStatus.PENDING_DEPOSIT,
          bookingOrder: savedOrder,
          bookingDate: new Date(),
        });
      });
      const savedBookings = await queryRunner.manager.save(bookingsToCreate);

      // 5. Xử lý mời bạn bè (nếu có)
      if (inviteeIds && inviteeIds.length > 0) {
        const inviteesToSave: BookingInvitee[] = [];
        for (const inviteeId of inviteeIds) {
          if (inviteeId === user.userId) continue;
          const inviteeExists = await this.userRepository.findOneBy({
            userId: inviteeId,
          });
          if (!inviteeExists) {
            // Ném ra lỗi rõ ràng thay vì để DB báo lỗi
            throw new HttpException(
              `Không tìm thấy người dùng được mời với ID ${inviteeId}.`,
              HttpStatus.NOT_FOUND,
            );
          }
          // TODO: Kiểm tra xem user có tồn tại không
          for (const booking of savedBookings) {
            const newInvitee = this.bookingInviteeRepository.create({
              booking: booking,
              user: { userId: inviteeId } as User,
            });
            inviteesToSave.push(newInvitee);
          }
        }
        await queryRunner.manager.save(inviteesToSave);
      }

      // 6. Tạo một Payment duy nhất cho Order tổng
      const depositPayment = queryRunner.manager.create(Payment, {
        amount: totalDeposit,
        paymentMethod: PaymentMethod.DPS,
        paymentStatus: PaymentStatus.PENDING,
        user: user,
        bookingOrder: savedOrder,
        transactionCode: `DPS-${Date.now()}`,
      });
      await queryRunner.manager.save(depositPayment);

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
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
