import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

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

  @IsDateString()
  @IsNotEmpty()
  bookingDate: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Mỗi inviteeId phải là một UUID hợp lệ' })
  inviteeIds?: string[]; // Đổi thành một mảng các chuỗi UUID
}
