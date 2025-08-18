import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Court } from './court.entity';

@Entity()
export class CourtImage {
  @PrimaryGeneratedColumn('uuid')
  imageId: string;

  @Column()
  imageUrl: string;

  @ManyToOne(() => Court, (court) => court.courtImages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courtId' })
  court: Court;
}
