import { BookingOrder } from 'src/booking/entities/booking-order.entity';
import { PaymentMethod } from 'src/common/enum/PaymentMethod';
import { PaymentStatus } from 'src/common/enum/PaymentStatus';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  paymentId: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column()
  paymentMethod: PaymentMethod;

  @Column()
  paymentStatus: PaymentStatus;

  @Column()
  transactionCode: string;

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => BookingOrder, (order) => order.payments)
  @JoinColumn({ name: 'bookingOrderId' })
  bookingOrder: BookingOrder;
}
