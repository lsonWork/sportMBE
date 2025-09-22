import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn('uuid')
  friendRequestId: string;

  @Column()
  fromId: string;

  @Column()
  toId: string;

  @Column()
  status: boolean;

  @Column()
  createdAt: Date;

  // Quan hệ với User - người gửi
  @ManyToOne(() => User)
  @JoinColumn({ name: 'fromId' })
  from: User;

  // Quan hệ với User - người nhận
  @ManyToOne(() => User)
  @JoinColumn({ name: 'toId' })
  to: User;
}
