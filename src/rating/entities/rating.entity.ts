import { Court } from 'src/court/entities/court.entity';
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

  @Column({ type: 'double precision' })
  number: number;

  @ManyToOne(() => Court, (court) => court.ratings)
  @JoinColumn({ name: 'courtId' })
  court: Court;
}
