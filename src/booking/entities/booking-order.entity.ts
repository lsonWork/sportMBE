import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { BookingStatus } from 'src/common/enum/BookingStatus';

@Entity()
export class BookingOrder {
  @PrimaryGeneratedColumn('uuid')
  orderId: string;

  @Column()
  totalPrice: number;

  @Column()
  totalDeposit: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING_DEPOSIT,
  })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.bookingOrders)
  user: User;

  @OneToMany(() => Booking, (booking) => booking.bookingOrder)
  bookings: Booking[];

  @OneToMany(() => Payment, (payment) => payment.bookingOrder)
  payments: Payment[];
}
