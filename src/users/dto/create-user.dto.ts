import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MinLength,
  Matches,
  IsBoolean,
  MaxLength,
  IsString
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @IsEnum(UserRole, { message: 'Role must be one of: user, technician, admin' })
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Department must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  department?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Position must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  position?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
