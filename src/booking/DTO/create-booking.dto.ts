import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class AmPmSlotsDto {
  @IsArray()
  @IsString({ each: true })
  slotIds: string[];
}

class SelectionDto {
  @IsDateString()
  date: string;

  @ValidateNested()
  @Type(() => AmPmSlotsDto)
  am: AmPmSlotsDto;

  @ValidateNested()
  @Type(() => AmPmSlotsDto)
  pm: AmPmSlotsDto;
}

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  courtId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectionDto)
  selections: SelectionDto[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  inviteeIds?: string[];
}
