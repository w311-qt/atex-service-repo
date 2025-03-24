import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class EquipmentFilterDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  statusId?: string;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  location?: string;

  @IsEnum(['name', 'model', 'inventoryNumber', 'purchaseDate', 'createdAt'], {
    message: 'Sort must be one of: name, model, inventoryNumber, purchaseDate, createdAt',
  })
  @IsOptional()
  sortBy?: string = 'name';

  @IsEnum(['ASC', 'DESC'], { message: 'Order must be ASC or DESC' })
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'ASC';

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;
}
