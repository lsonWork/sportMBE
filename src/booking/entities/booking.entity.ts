import { BookingInvitee } from 'src/booking-invitee/entities/booking-invitee.entity';
import { Court } from 'src/court/entities/court.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingOrder } from './booking-order.entity';

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

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Column()
  status: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  deposit: number;

  @Column()
  bookingDate: Date;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Court, (court) => court.bookings)
  @JoinColumn({ name: 'courtId' })
  court: Court;

  @OneToMany(() => BookingInvitee, (invitee) => invitee.booking)
  invitees: BookingInvitee[];

  @ManyToOne(() => BookingOrder, (order) => order.bookings)
  bookingOrder: BookingOrder;
}
