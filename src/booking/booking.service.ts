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
import { Notification } from 'src/notification/entities/notification.entity';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { CompleteBookingDto } from './DTO/complete-booking.dto';
import { Role } from 'src/common/enum/Role';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { NotificationType } from 'src/common/enum/NotificationType';

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
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createBooking(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<BookingOrder> {
    const { courtId, selections, inviteeIds, notes } = createBookingDto;

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

    let savedOrder: BookingOrder; // Khai báo savedOrder ở ngoài để dùng được ở cả try và sau đó

    try {
      const slotsToBook: { startTime: Date; endTime: Date }[] = [];

      for (const selection of selections) {
        const date = selection.date;
        const allSlotIds = [...selection.am.slotIds, ...selection.pm.slotIds];
        for (const slotId of allSlotIds) {
          let startHour = parseInt(slotId.substring(5, 7));
          if (selection.pm.slotIds.includes(slotId) && startHour < 12) {
            startHour += 12;
          }
          const startTime = new Date(date);
          startTime.setHours(startHour, 0, 0, 0);
          const endTime = new Date(date);
          endTime.setHours(startHour + 1, 0, 0, 0);
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

      const totalBookingPrice = slotsToBook.length * court.pricePerHour;
      const totalDeposit = totalBookingPrice * 0.2;

      const newOrder = queryRunner.manager.create(BookingOrder, {
        user,
        totalPrice: totalBookingPrice,
        totalDeposit,
        status: BookingStatus.PENDING_DEPOSIT,
        notes: notes,
      });
      savedOrder = await queryRunner.manager.save(newOrder);

      const bookingsToCreate = slotsToBook.map((slot) =>
        queryRunner.manager.create(Booking, {
          court,
          user,
          ...slot,
          totalPrice: court.pricePerHour,
          deposit: court.pricePerHour * 0.2,
          status: BookingStatus.PENDING_DEPOSIT,
          bookingOrder: savedOrder,
          bookingDate: new Date(),
        }),
      );
      const savedBookings = await queryRunner.manager.save(bookingsToCreate);

      if (inviteeIds && inviteeIds.length > 0) {
        const inviteesToSave: BookingInvitee[] = [];
        for (const inviteeId of inviteeIds) {
          if (inviteeId === user.userId) continue;
          // Có thể gộp các lần kiểm tra invitee này lại thành 1 query để tối ưu
          const inviteeExists = await this.userRepository.findOneBy({
            userId: inviteeId,
          });
          if (!inviteeExists) {
            throw new HttpException(
              `Không tìm thấy người dùng được mời với ID ${inviteeId}.`,
              HttpStatus.NOT_FOUND,
            );
          }
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

      const depositPayment = queryRunner.manager.create(Payment, {
        amount: totalDeposit,
        paymentMethod: PaymentMethod.DPS,
        paymentStatus: PaymentStatus.PENDING,
        user: user,
        bookingOrder: savedOrder,
        transactionCode: `DPS-${Date.now()}`,
      });
      await queryRunner.manager.save(depositPayment);

      // Tạo thông báo cho chính người đặt sân
      const successBookingNotification = queryRunner.manager.create(
        Notification,
        {
          content: `Bạn đã đặt sân thành công tại ${court.courtName}.`,
          user: user, // userId sẽ được tự động lấy từ quan hệ
          type: NotificationType.BOOKING_SUCCESS,
        },
      );
      await queryRunner.manager.save(successBookingNotification);

      // Chỉ commit một lần ở cuối
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    // --- GỬI THÔNG BÁO WEBSOCKET SAU KHI TRANSACTION THÀNH CÔNG ---

    // Gửi cho người đặt sân
    const successNotificationPayload = {
      title: 'Đặt sân thành công',
      message: `Bạn đã đặt sân thành công tại ${court.courtName}.`,
      orderId: savedOrder.orderId,
    };
    this.notificationGateway.emitToUsers(
      [user.userId],
      successNotificationPayload,
      NotificationType.BOOKING_SUCCESS,
    );

    // Gửi cho những người được mời
    if (inviteeIds && inviteeIds.length > 0) {
      const inviteNotificationPayload = {
        title: 'Lời mời chơi cùng',
        message: `${user.fullName} đã mời bạn tham gia một lượt đặt sân.`,
        orderId: savedOrder.orderId,
      };
      this.notificationGateway.emitToUsers(
        inviteeIds,
        inviteNotificationPayload,
        NotificationType.INVITED_TO_BOOKING,
      );
    }
    return savedOrder;
  }
  /**
   * Owner xác nhận đã nhận tiền cọc cho cả một đơn hàng.
   */
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
      if (!bookingOrder.bookings || bookingOrder.bookings.length === 0) {
        throw new HttpException(
          'Đơn hàng không hợp lệ.',
          HttpStatus.BAD_REQUEST,
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

      bookingOrder.bookings.forEach(
        (b) => (b.status = BookingStatus.CONFIRMED),
      );
      await queryRunner.manager.save(bookingOrder.bookings);

      const depositPayment = bookingOrder.payments.find(
        (p) => p.paymentMethod === PaymentMethod.DPS,
      );
      if (depositPayment) {
        depositPayment.paymentStatus = PaymentStatus.SUCCESS;
        await queryRunner.manager.save(depositPayment);
      }

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
    // Sử dụng transaction để đảm bảo toàn vẹn dữ liệu
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const bookingOrder = await transactionalEntityManager.findOne(
        BookingOrder,
        {
          where: { orderId },
          relations: [
            'bookings',
            'bookings.court',
            'bookings.court.owner',
            'user',
          ],
        },
      );
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

      const remainingAmount =
        bookingOrder.totalPrice - bookingOrder.totalDeposit;
      const finalPayment = transactionalEntityManager.create(Payment, {
        amount: remainingAmount,
        paymentMethod: completeBookingDto.finalPaymentMethod,
        paymentStatus: PaymentStatus.SUCCESS,
        bookingOrder: bookingOrder,
        user: bookingOrder.user,
        transactionCode: `FNL-${Date.now()}`,
      });
      await transactionalEntityManager.save(finalPayment);

      bookingOrder.bookings.forEach(
        (b) => (b.status = BookingStatus.COMPLETED),
      );
      await transactionalEntityManager.save(bookingOrder.bookings);

      bookingOrder.status = BookingStatus.COMPLETED;
      return transactionalEntityManager.save(bookingOrder);
    });
  }

  /**
   * Người dùng tự hủy toàn bộ đơn hàng của mình.
   */
  async cancelBookingOrder(
    orderId: string,
    userId: string,
  ): Promise<BookingOrder> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const bookingOrder = await transactionalEntityManager.findOne(
        BookingOrder,
        {
          where: { orderId },
          relations: ['user', 'bookings'],
        },
      );

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

      bookingOrder.bookings.forEach(
        (b) => (b.status = BookingStatus.CANCELLED),
      );
      await transactionalEntityManager.save(bookingOrder.bookings);

      bookingOrder.status = BookingStatus.CANCELLED;
      return transactionalEntityManager.save(bookingOrder);
    });
  }

  /**
   * Client lấy danh sách các đơn hàng của mình.
   */
  async getMyBookingOrders(
    userId: string,
    options: IPaginationOptions,
    status?: BookingStatus,
  ): Promise<Pagination<BookingOrder>> {
    const queryBuilder = this.bookingOrderRepository.createQueryBuilder('bo');

    queryBuilder
      // SỬA LẠI ĐIỀU KIỆN WHERE Ở ĐÂY
      .where('bo.userUserId = :userId', { userId })
      .leftJoinAndSelect('bo.bookings', 'booking')
      .leftJoinAndSelect('booking.court', 'court')
      .orderBy('bo.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('bo.status = :status', { status });
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
      this.bookingOrderRepository.createQueryBuilder('bookingOrder');
    queryBuilder
      // JOIN với các booking con để có thể lọc theo courtId
      .innerJoin('bookingOrder.bookings', 'booking')
      // Lấy các thông tin chi tiết cần thiết để hiển thị
      .leftJoinAndSelect('bookingOrder.user', 'user')
      .leftJoinAndSelect('bookingOrder.bookings', 'bookingDetails')
      .leftJoinAndSelect('bookingDetails.court', 'courtDetails')
      // Điều kiện lọc chính
      .where('booking.courtId = :courtId', { courtId })
      .orderBy('bookingOrder.createdAt', 'DESC')
      // Đảm bảo mỗi order chỉ xuất hiện một lần
      .distinct(true);

    if (status) {
      queryBuilder.andWhere('bookingOrder.status = :status', { status });
    }
    if (search) {
      queryBuilder.andWhere('user.fullName ILIKE :search', {
        search: `%${search}%`,
      });
    }

    return paginate<BookingOrder>(queryBuilder, options);
  }
}
