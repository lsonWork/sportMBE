import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  courtId: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsOptional() // Cho phép trường này có thể không được gửi lên
  @IsUUID() // Nếu có, phải là một UUID hợp lệ
  inviteeId?: string;
}
