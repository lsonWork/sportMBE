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

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  totalDeposit: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING_DEPOSIT,
  })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User, (user) => user.bookingOrders)
  user: User;

  @OneToMany(() => Booking, (booking) => booking.bookingOrder)
  bookings: Booking[];

  @OneToMany(() => Payment, (payment) => payment.bookingOrder)
  payments: Payment[];
}
