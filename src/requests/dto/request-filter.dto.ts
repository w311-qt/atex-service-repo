import { IsEnum, IsOptional, IsString, IsUUID, IsArray, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class RequestFilterDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsUUID()
  @IsOptional()
  typeId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  typeIds?: string[];

  @IsUUID()
  @IsOptional()
  statusId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  statusIds?: string[];

  @IsUUID()
  @IsOptional()
  priorityId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  priorityIds?: string[];

  @IsUUID()
  @IsOptional()
  createdById?: string;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsUUID()
  @IsOptional()
  equipmentId?: string;

  @IsString()
  @IsOptional()
  cartridgeModel?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsOptional()
  @IsDateString()
  createdFromDate?: string;

  @IsOptional()
  @IsDateString()
  createdToDate?: string;

  @IsOptional()
  @IsDateString()
  completedFromDate?: string;

  @IsOptional()
  @IsDateString()
  completedToDate?: string;

  @IsEnum(['number', 'title', 'createdAt', 'updatedAt', 'completedAt'], {
    message: 'Sort must be one of: number, title, createdAt, updatedAt, completedAt',
  })
  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsEnum(['ASC', 'DESC'], { message: 'Order must be ASC or DESC' })
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;
}
