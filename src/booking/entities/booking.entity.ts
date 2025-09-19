import { BookingInvitee } from 'src/booking-invitee/entities/booking-invitee.entity';
import { Court } from 'src/court/entities/court.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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
  status: string;

  @Column()
  deposit: number;

  @Column()
  bookingDate: Date;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Payment, (payment) => payment.booking)
  payment: Payment;

  @ManyToOne(() => Court, (court) => court.bookings)
  @JoinColumn({ name: 'courtId' })
  court: Court;

  @OneToMany(() => BookingInvitee, (invitee) => invitee.booking)
  invitees: BookingInvitee[];
}
