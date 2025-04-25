import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class EquipmentAnalyticsFilterDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  statusIds?: string[];

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  location?: string;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], {
    message: 'Group must be one of: daily, weekly, monthly, quarterly, yearly',
  })
  groupBy?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  format?: 'table' | 'chart' = 'table';
}
