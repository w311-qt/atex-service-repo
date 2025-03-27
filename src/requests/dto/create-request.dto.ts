import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  MaxLength,
  IsEnum
} from 'class-validator';
import { Transform } from 'class-transformer';

// This enum should match your database enum if you're using one
export enum RequestPriorityEnum {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// This enum should match your database enum if you're using one
export enum RequestTypeEnum {
  REPAIR = 'repair',
  CARTRIDGE_REFILL = 'cartridgeRefill',
  DISPOSAL = 'disposal',
  RELOCATION = 'relocation',
}

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
  @IsNotEmpty({ message: 'Type ID is required' })
  typeId: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Priority ID is required' })
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

  // This is an alternative approach using enums directly instead of UUIDs
  // We're keeping both approaches for flexibility - comment out whichever you don't need

  /*
  @IsEnum(RequestTypeEnum, {
    message: `Type must be one of: ${Object.values(RequestTypeEnum).join(', ')}`
  })
  @IsNotEmpty({ message: 'Type is required' })
  type: RequestTypeEnum;

  @IsEnum(RequestPriorityEnum, {
    message: `Priority must be one of: ${Object.values(RequestPriorityEnum).join(', ')}`
  })
  @IsNotEmpty({ message: 'Priority is required' })
  priority: RequestPriorityEnum;
  */
}
