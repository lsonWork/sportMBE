import { Expose } from 'class-transformer';

export class UserResponseDTO {
  @Expose() // Đánh dấu thuộc tính này sẽ được hiển thị
  userId: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  avatarUrl: string;

  @Expose()
  role: string;

  @Expose()
  status: boolean;
}
