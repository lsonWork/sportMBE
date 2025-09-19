import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Court } from 'src/court/entities/court.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { CreateBookingDto } from './DTO/create-booking.dto';
import { User } from 'src/user/entities/user.entity';
import { BookingStatus } from 'src/common/enum/BookingStatus';
import { Role } from 'src/common/enum/Role';
import { CompleteBookingDto } from './DTO/complete-booking.dto';
import { PaymentStatus } from 'src/common/enum/PaymentStatus';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(Court) private courtRepository: Repository<Court>,
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
  ) {}

  async createBooking(
    createBookingDto: CreateBookingDto,
    user: User,
  ): Promise<Booking> {
    const { courtId, startTime, endTime } = createBookingDto;
    const court = await this.courtRepository.findOneBy({ courtId: courtId });
    if (!court) {
      throw new HttpException(
        { message: 'Court not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const durationInHours = (endDate.getTime() - startDate.getTime()) / 3600000;

    if (durationInHours <= 0) {
      throw new HttpException(
        { message: 'End time must be after start time' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const totalPrice = durationInHours * court.pricePerHour;
    const deposit = totalPrice * 0.2;

    const newBooking = this.bookingRepository.create({
      court,
      user,
      startTime: startDate,
      endTime: endDate,
      totalPrice,
      deposit,
      bookingDate: new Date(),
    });
    const savedBooking = await this.bookingRepository.save(newBooking);

    const depositPayment = this.paymentRepository.create({
      amount: deposit,
      paymentMethod: 'BANK_TRANSFER',
      paymentStatus: PaymentStatus.PENDING,
      booking: savedBooking,
      user: user,
    });
    await this.paymentRepository.save(depositPayment);

    return savedBooking;
  }

  async confirmBooking(bookingId: string, currentUser: User): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId: bookingId },
      relations: ['user'],
    });

    if (!booking) {
      throw new HttpException(
        { message: `Booking with ID "${bookingId}" not found` },
        HttpStatus.NOT_FOUND,
      );
    }
    if (
      booking.user.userId !== currentUser.userId &&
      currentUser.role !== Role.OWNER
    ) {
      throw new HttpException(
        { message: 'You do not have permission to confirm this booking.' },
        HttpStatus.FORBIDDEN,
      );
    }
    if (
      booking.status === BookingStatus.PENDING_DEPOSIT ||
      booking.status === BookingStatus.CANCELLED
    ) {
      throw new HttpException(
        { message: 'This booking has already been confirmed or cancelled.' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const depositPayment = await this.paymentRepository.findOneBy({
      booking: { bookingId },
    });
    if (depositPayment) {
      depositPayment.paymentStatus = PaymentStatus.SUCCESS;
      await this.paymentRepository.save(depositPayment);
    }
    booking.status = BookingStatus.CONFIRMED;
    return this.bookingRepository.save(booking);
  }

  async completeBooking(
    bookingId: string,
    completeBookingDto: CompleteBookingDto,
    currentUser: User,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId },
      relations: ['court', 'court.owner'],
    });

    if (!booking) {
      throw new HttpException(
        { message: `Booking with ID "${bookingId}" not found` },
        HttpStatus.NOT_FOUND,
      );
    }
    if (
      booking.court.owner.userId !== currentUser.userId && // Chủ sân
      currentUser.role !== Role.OWNER
    ) {
      throw new HttpException(
        { message: 'You do not have permission to complete this booking.' },
        HttpStatus.FORBIDDEN,
      );
    }
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new HttpException(
        {
          message: `Booking cannot be completed because its status is '${booking.status}'`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const remainingAmount = booking.totalPrice - booking.deposit;
    const finalPayment = this.paymentRepository.create({
      amount: remainingAmount,
      paymentMethod: completeBookingDto.finalPaymentMethod,
      paymentStatus: PaymentStatus.SUCCESS,
      booking: booking,
      user: booking.user,
    });
    await this.paymentRepository.save(finalPayment);
    booking.status = BookingStatus.COMPLETED;
    return this.bookingRepository.save(booking);
  }

  async cancelBookingByUser(
    bookingId: string,
    currentUser: User,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId },
      relations: ['user'],
    });

    if (!booking) {
      throw new HttpException(
        {
          message: `Booking with ID "${bookingId}" not found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (booking.user.userId !== currentUser.userId) {
      throw new HttpException(
        {
          message: 'You can only cancel your own bookings.',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    if (
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED
    ) {
      throw new HttpException(
        {
          message: `This booking cannot be cancelled as it is already '${booking.status}'.`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    booking.status = BookingStatus.CANCELLED;

    return this.bookingRepository.save(booking);
  }
}
