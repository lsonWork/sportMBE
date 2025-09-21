import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Double,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourtImage } from './courtImage.entity';
import { SportType } from 'src/sport-type/entities/sportType.entity';
import { Feedback } from 'src/feedback/entities/feedback.entity';
import { Booking } from 'src/booking/entities/booking.entity';

@Entity()
export class Court {
  @PrimaryGeneratedColumn('uuid')
  courtId: string;

  @Column()
  courtName: string;

  @Column()
  address: string;

  @Column()
  description: string;

  @Column()
  pricePerHour: number;

  @Column()
  isActive: boolean;

  @Column()
  subService: string;

  @Column({ type: 'double precision' })
  lat: number;

  @Column({ type: 'double precision' })
  lng: number;

  @ManyToOne(() => User, (user) => user.courts)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => CourtImage, (courtImage) => courtImage.court)
  courtImages: CourtImage[];

  @ManyToOne(() => SportType, (sportType) => sportType.courts)
  @JoinColumn({ name: 'sportTypeId' })
  sportType: SportType;

  @OneToMany(() => Feedback, (feedback) => feedback.court)
  feedbacks: Feedback[];

  @OneToMany(() => Booking, (booking) => booking.court)
  bookings: Booking[];
}
