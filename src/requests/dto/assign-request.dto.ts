import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class AssignRequestDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  comment?: string;
}

export class BulkAssignRequestDto {
  @IsUUID()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsNotEmpty({ message: 'Request IDs are required' })
  requestIds: string[];

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  comment?: string;
}
