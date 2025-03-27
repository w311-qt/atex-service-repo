import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, IsISO8601 } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Model must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  model?: string;

  @IsString()
  @IsNotEmpty({ message: 'Inventory number is required' })
  @MaxLength(100, { message: 'Inventory number must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  inventoryNumber: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  image?: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Category is required' })
  categoryId: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Status is required' })
  statusId: string;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Location must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  location?: string;

  @IsISO8601()
  @IsOptional()
  purchaseDate?: string;
}
