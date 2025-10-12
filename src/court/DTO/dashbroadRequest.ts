import { IsOptional } from 'class-validator';

export class DashboardRequest {
  @IsOptional()
  startDate?: Date;
  @IsOptional()
  endDate?: Date;
}
