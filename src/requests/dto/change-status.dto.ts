import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class ChangeStatusDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Status ID is required' })
  statusId: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Status notes must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  notes?: string;
}
