import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class ChangeStatusDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Status ID is required' })
  statusId: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Comment must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  comment?: string;
}

export class AssignRequestDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Comment must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  comment?: string;
}

export class AddCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Comment is required' })
  @MaxLength(1000, { message: 'Comment must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  comment: string;
}

export class CompleteRequestDto {
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Resolution comment must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  resolutionComment?: string;
}

export class CancelRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Cancellation reason is required' })
  @MaxLength(500, { message: 'Cancellation reason must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  reason: string;
}
