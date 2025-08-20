import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
