import { UserSubscription } from 'src/user/entities/userSubcription.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  subscriptionId: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  duration: number;

  @Column()
  description: string;

  @OneToMany(
    () => UserSubscription,
    (userSubscription) => userSubscription.subscription,
  )
  userSubscriptions: UserSubscription[];
}
