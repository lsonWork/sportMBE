import { Court } from 'src/court/entities/court.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SportType {
  @PrimaryGeneratedColumn('uuid')
  sportTypeId: string;

  @Column({ unique: true })
  typeName: string;

  @Column()
  status: boolean;

  @OneToMany(() => Court, (court) => court.sportType)
  courts: Court[];
}
