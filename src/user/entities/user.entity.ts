import { Advertisement } from 'src/advertisement/entities/advertisement.entity';
import { Court } from 'src/court/entities/court.entity';
import { Feedback } from 'src/feedback/entities/feedback.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserSubscription } from './userSubcription.entity';
import { Booking } from 'src/booking/entities/booking.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { RequestUpdate } from 'src/request-update/entities/request-update.entity';
import { BookingInvitee } from 'src/booking-invitee/entities/booking-invitee.entity';
import { FriendRequest } from 'src/friend-request/entities/friendRequest.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  gender: boolean;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column()
  status: boolean;

  @Column()
  role: string;

  @Column({ nullable: true })
  bankAccount: string;

  @Column({ nullable: true })
  documentUrl: string;

  @Column({ nullable: true })
  bio: string;

  @OneToMany(() => Advertisement, (advertisement) => advertisement.owner)
  advertisements: Advertisement[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Court, (court) => court.owner)
  courts: Court[];

  @OneToMany(() => Feedback, (feedback) => feedback.owner)
  feedbacks: Feedback[];

  @OneToMany(
    () => UserSubscription,
    (userSubscription) => userSubscription.user,
  )
  userSubscriptions: UserSubscription[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => RequestUpdate, (requestUpdate) => requestUpdate.user)
  requestUpdates: RequestUpdate[];

  @OneToMany(() => BookingInvitee, (invitee) => invitee.user)
  bookingInvitations: BookingInvitee[];

  @OneToMany(() => FriendRequest, (fr) => fr.from)
  sentFriendRequests: FriendRequest[]; // các request mà user gửi

  @OneToMany(() => FriendRequest, (fr) => fr.to)
  receivedFriendRequests: FriendRequest[]; // các request mà user nhận
}
