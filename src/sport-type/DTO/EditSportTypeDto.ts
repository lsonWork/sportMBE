import { IsString } from 'class-validator';

export class EditSportTypeDto {
  @IsString()
  name?: string;
}
