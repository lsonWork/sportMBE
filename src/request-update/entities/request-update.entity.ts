import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RequestUpdate {
  @PrimaryGeneratedColumn('uuid')
  requestUpdateId: string;

  @Column()
  documentUrl: string;

  @Column()
  createdAt: Date;

  @Column()
  status: boolean;

  @ManyToOne(() => User, (user) => user.requestUpdates)
  @JoinColumn({ name: 'userId' })
  user: User;
}
