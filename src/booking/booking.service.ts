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
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { CompleteBookingDto } from './DTO/complete-booking.dto';
import { Role } from 'src/common/enum/Role';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(Court) private courtRepository: Repository<Court>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @InjectRepository(BookingOrder)
    private bookingOrderRepository: Repository<BookingOrder>,
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
  async confirmBookingOrder(
    orderId: string,
    ownerId: string,
  ): Promise<BookingOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const bookingOrder = await queryRunner.manager.findOne(BookingOrder, {
        where: { orderId },
        relations: [
          'bookings',
          'bookings.court',
          'bookings.court.owner',
          'payments',
        ],
      });

      if (!bookingOrder) {
        throw new HttpException(
          `Không tìm thấy đơn hàng với ID "${orderId}"`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (bookingOrder.bookings[0].court.owner.userId !== ownerId) {
        throw new HttpException(
          'Bạn không có quyền xác nhận đơn hàng này.',
          HttpStatus.FORBIDDEN,
        );
      }
      if (bookingOrder.status !== BookingStatus.PENDING_DEPOSIT) {
        throw new HttpException(
          'Đơn hàng này không ở trạng thái chờ xác nhận cọc.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Cập nhật trạng thái của tất cả booking con
      for (const booking of bookingOrder.bookings) {
        booking.status = BookingStatus.CONFIRMED;
      }
      await queryRunner.manager.save(bookingOrder.bookings);

      // Cập nhật trạng thái của payment
      const depositPayment = bookingOrder.payments.find(
        (p) => p.paymentMethod === PaymentMethod.DPS,
      );
      if (depositPayment) {
        depositPayment.paymentStatus = PaymentStatus.SUCCESS;
        await queryRunner.manager.save(depositPayment);
      }

      // Cập nhật trạng thái của order tổng
      bookingOrder.status = BookingStatus.CONFIRMED;
      const savedOrder = await queryRunner.manager.save(bookingOrder);

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Owner xác nhận đã thanh toán đủ cho cả đơn hàng.
   */
  async completeBookingOrder(
    orderId: string,
    ownerId: string,
    completeBookingDto: CompleteBookingDto,
  ): Promise<BookingOrder> {
    const bookingOrder = await this.bookingOrderRepository.findOne({
      where: { orderId },
      relations: ['bookings', 'bookings.court', 'bookings.court.owner', 'user'],
    });
    if (!bookingOrder) {
      throw new HttpException(
        `Không tìm thấy đơn hàng với ID "${orderId}"`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (bookingOrder.bookings[0].court.owner.userId !== ownerId) {
      throw new HttpException(
        'Bạn không có quyền hoàn tất đơn hàng này.',
        HttpStatus.FORBIDDEN,
      );
    }
    if (bookingOrder.status !== BookingStatus.CONFIRMED) {
      throw new HttpException(
        `Không thể hoàn tất vì đơn hàng đang ở trạng thái '${bookingOrder.status}'`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const remainingAmount = bookingOrder.totalPrice - bookingOrder.totalDeposit;
    const finalPayment = this.paymentRepository.create({
      amount: remainingAmount,
      paymentMethod: completeBookingDto.finalPaymentMethod,
      paymentStatus: PaymentStatus.SUCCESS,
      bookingOrder: bookingOrder,
      user: bookingOrder.user,
    });
    await this.paymentRepository.save(finalPayment);

    // Cập nhật trạng thái cho tất cả booking con và order tổng
    bookingOrder.bookings.forEach((b) => (b.status = BookingStatus.COMPLETED));
    await this.bookingRepository.save(bookingOrder.bookings);

    bookingOrder.status = BookingStatus.COMPLETED;
    return this.bookingOrderRepository.save(bookingOrder);
  }
  /**
   * Người dùng tự hủy toàn bộ đơn hàng của mình.
   */
  async cancelBookingOrder(
    orderId: string,
    userId: string,
  ): Promise<BookingOrder> {
    const bookingOrder = await this.bookingOrderRepository.findOne({
      where: { orderId },
      relations: ['user', 'bookings'],
    });

    if (!bookingOrder) {
      throw new HttpException(
        `Không tìm thấy đơn hàng với ID "${orderId}"`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (bookingOrder.user.userId !== userId) {
      throw new HttpException(
        'Bạn chỉ có thể hủy các đơn hàng của chính mình.',
        HttpStatus.FORBIDDEN,
      );
    }
    if (
      bookingOrder.status === BookingStatus.COMPLETED ||
      bookingOrder.status === BookingStatus.CANCELLED
    ) {
      throw new HttpException(
        `Không thể hủy vì đơn hàng đã ở trạng thái '${bookingOrder.status}'.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cập nhật trạng thái cho tất cả booking con và order tổng
    bookingOrder.bookings.forEach((b) => (b.status = BookingStatus.CANCELLED));
    await this.bookingRepository.save(bookingOrder.bookings);

    bookingOrder.status = BookingStatus.CANCELLED;
    return this.bookingOrderRepository.save(bookingOrder);
  }

  /**
   * Client lấy danh sách các đơn hàng của mình.
   */
  async getMyBookingOrders(
    userId: string,
    options: IPaginationOptions,
    status?: BookingStatus,
  ): Promise<Pagination<BookingOrder>> {
    const queryBuilder =
      this.bookingOrderRepository.createQueryBuilder('order');

    queryBuilder
      .where('order.userId = :userId', { userId })
      // Lấy chi tiết các slot (booking) và thông tin sân
      .leftJoinAndSelect('order.bookings', 'booking')
      .leftJoinAndSelect('booking.court', 'court')
      .orderBy('order.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    return paginate<BookingOrder>(queryBuilder, options);
  }

  /**
   * Owner lấy danh sách các đơn hàng liên quan đến một sân.
   */
  async getBookingOrdersForCourt(
    courtId: string,
    currentUserId: string,
    options: IPaginationOptions,
    status?: BookingStatus,
    search?: string,
  ): Promise<Pagination<BookingOrder>> {
    const court = await this.courtRepository.findOne({
      where: { courtId },
      relations: ['owner'],
    });
    if (!court) {
      throw new HttpException(
        `Không tìm thấy sân với ID "${courtId}"`,
        HttpStatus.NOT_FOUND,
      );
    }
    const currentUser = await this.userRepository.findOneBy({
      userId: currentUserId,
    });
    if (!currentUser) {
      throw new HttpException(
        `Không tìm thấy người dùng với ID "${currentUserId}"`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (
      court.owner.userId !== currentUserId &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      currentUser.role !== Role.ADMIN
    ) {
      throw new HttpException(
        'Bạn không có quyền xem các đơn hàng của sân này.',
        HttpStatus.FORBIDDEN,
      );
    }

    const queryBuilder =
      this.bookingOrderRepository.createQueryBuilder('order');
    queryBuilder
      // Tìm các order có chứa booking của sân này
      .innerJoin('order.bookings', 'booking', 'booking.courtId = :courtId', {
        courtId,
      })
      // Lấy các thông tin chi tiết cần thiết
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.bookings', 'bookingDetails') // Lấy lại chi tiết booking
      .leftJoinAndSelect('bookingDetails.court', 'courtDetails')
      .orderBy('order.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }
    if (search) {
      queryBuilder.andWhere('user.fullName ILIKE :search', {
        search: `%${search}%`,
      });
    }

    return paginate<BookingOrder>(queryBuilder, options);
  }
}
