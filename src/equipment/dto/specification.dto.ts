import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class SpecificationDto {
  @IsString()
  @IsNotEmpty({ message: 'Key is required' })
  @MaxLength(100, { message: 'Key must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  key: string;

  @IsString()
  @IsNotEmpty({ message: 'Value is required' })
  @MaxLength(255, { message: 'Value must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  value: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Unit must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  unit?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Description must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;
}

export class CreateSpecificationDto extends SpecificationDto {}

export class UpdateSpecificationDto extends SpecificationDto {}
