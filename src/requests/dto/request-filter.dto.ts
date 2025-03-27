import { IsEnum, IsOptional, IsString, IsUUID, IsDate, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class RequestFilterDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsUUID()
  @IsOptional()
  typeId?: string;

  @IsUUID()
  @IsOptional()
  statusId?: string;

  @IsUUID()
  @IsOptional()
  priorityId?: string;

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
  @Transform(({ value }) => value?.trim())
  location?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  cartridgeModel?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  fromDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  toDate?: Date;

  @IsOptional()
  @IsIn(['true', 'false', true, false])
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  completed?: boolean;

  @IsEnum(['createdAt', 'updatedAt', 'completedAt', 'number', 'title', 'priority'], {
    message: 'Sort must be one of: createdAt, updatedAt, completedAt, number, title, priority',
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
