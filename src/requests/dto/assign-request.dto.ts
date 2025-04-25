import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class AssignRequestDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Technician ID is required' })
  technicianId: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Comment must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  comment?: string;
}