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
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  ratingId: string;

  @Column({ nullable: true })
  content: string;

  @Column()
  star: number;

  @Column()
  createdAt: Date;

  @Column()
  ownerId: string;

  @Column()
  courtId: string;

  @ManyToOne(() => Court, (court) => court.ratings)
  @JoinColumn({ name: 'courtId' })
  court: Court;

  @ManyToOne(() => User, (user) => user.ratings)
  @JoinColumn({ name: 'ownerId' })
  owner: User;
}
