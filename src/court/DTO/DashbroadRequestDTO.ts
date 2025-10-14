import { IsDateString, IsOptional } from 'class-validator';

export class DashboardRequestDTO {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'startDate phải là định dạng ngày tháng hợp lệ (YYYY-MM-DD)' },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'endDate phải là định dạng ngày tháng hợp lệ (YYYY-MM-DD)' },
  )
  endDate?: string;
}
