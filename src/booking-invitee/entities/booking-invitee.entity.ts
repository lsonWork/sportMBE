import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';

@Entity()
export class BookingInvitee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Booking, (booking) => booking.invitees)
  booking: Booking;

  @ManyToOne(() => User, (user) => user.bookingInvitations)
  user: User;
}
