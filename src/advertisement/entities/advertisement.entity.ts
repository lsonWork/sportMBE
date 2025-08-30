import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Advertisement {
  @PrimaryGeneratedColumn('uuid')
  advertisementId: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  imageUrl: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  status: boolean;

  @ManyToOne(() => User, (user) => user.advertisements)
  @JoinColumn({ name: 'ownerId' })
  owner: User;
}
