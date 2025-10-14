import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class OwnerPaymentInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accountName: string; // Tên chủ tài khoản

  @Column()
  accountNumber: string; // Số tài khoản

  @Column()
  bankName: string; // Tên ngân hàng

  @Column({ type: 'text', nullable: true })
  qrCodeUrl?: string; // URL của ảnh QR code

  // Quan hệ Một-Một với User
  @OneToOne(() => User, (user) => user.paymentInfo)
  @JoinColumn({ name: 'userId' }) // Cột khóa ngoại trong bảng này
  user: User;
}
