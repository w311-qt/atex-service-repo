import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestDto } from './create-request.dto';
import { IsUUID, IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

// This enum should match your database enum if you're using one
export enum RequestStatusEnum {
  NEW = 'new',
  IN_PROGRESS = 'inProgress',
  WAITING = 'waiting',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class UpdateRequestDto extends PartialType(CreateRequestDto) {
  // Additional fields that can only be updated (not set during creation)

  @IsUUID()
  @IsOptional()
  statusId?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  statusMessage?: string;

  // Alternative approach using enum directly instead of UUID
  /*
  @IsEnum(RequestStatusEnum, {
    message: `Status must be one of: ${Object.values(RequestStatusEnum).join(', ')}`
  })
  @IsOptional()
  status?: RequestStatusEnum;
  */
}
