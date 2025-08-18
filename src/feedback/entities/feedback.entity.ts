import { Court } from 'src/court/entities/court.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  feedbackId: string;

  @Column()
  content: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => Court, (court) => court.feedbacks)
  @JoinColumn({ name: 'courtId' })
  court: Court;

  @ManyToOne(() => User, (user) => user.feedbacks)
  @JoinColumn({ name: 'ownerId' })
  owner: User;
}
