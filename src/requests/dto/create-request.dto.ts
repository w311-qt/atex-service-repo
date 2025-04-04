import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Type is required' })
  typeId: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Priority is required' })
  priorityId: string;

  @IsUUID()
  @IsOptional()
  equipmentId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Cartridge model must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  cartridgeModel?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Location must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  location?: string;
}
