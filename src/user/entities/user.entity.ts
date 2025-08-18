import { Advertisement } from 'src/advertisement/entities/advertisement.entity';
import { Court } from 'src/court/entities/court.entity';
import { Feedback } from 'src/feedback/entities/feedback.entity';
import { Message } from 'src/message/entities/message.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserSubscription } from './userSubcription.entity';
import { Booking } from 'src/booking/entities/booking.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  password: string;

  @Column()
  avatarUrl: string;

  @Column()
  status: boolean;

  @Column()
  role: string;

  @Column()
  bankAccount: string;

  @Column()
  documentUrl: string;

  @OneToMany(() => Advertisement, (advertisement) => advertisement.owner)
  advertisements: Advertisement[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Court, (court) => court.owner)
  courts: Court[];

  @OneToMany(() => Feedback, (feedback) => feedback.owner)
  feedbacks: Feedback[];

  @OneToMany(
    () => UserSubscription,
    (userSubscription) => userSubscription.user,
  )
  subscriptions: UserSubscription[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];
}
