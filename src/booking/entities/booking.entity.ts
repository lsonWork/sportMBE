import { Payment } from 'src/payment/entities/payment.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  bookingId: string;

  @Column()
  courtId: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column()
  totalPrice: number;

  @Column()
  status: boolean;

  @Column()
  deposit: number;

  @Column()
  bookingDate: Date;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Payment, (payment) => payment.booking)
  payment: Payment;
}
