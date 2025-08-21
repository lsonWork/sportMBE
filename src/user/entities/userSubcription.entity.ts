import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Subscription } from 'src/subcription/entities/subscription.entity';

@Entity()
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  userSubscriptionId: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  status: string;

  @Column()
  paymentId: string;

  @ManyToOne(() => User, (user) => user.userSubscriptions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(
    () => Subscription,
    (subscription) => subscription.userSubscriptions,
  )
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;
}
