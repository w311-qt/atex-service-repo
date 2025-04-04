import { Expose, Type } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import { ActivityType } from '../entities/request-activity.entity';

export class RequestActivityResponseDto {
  @Expose()
  id: string;

  @Expose()
  requestId: string;

  @Expose()
  userId: string;

  @Expose()
  @Type(() => User)
  user: User;

  @Expose()
  type: ActivityType;

  @Expose()
  message: string;

  @Expose()
  oldValue: string;

  @Expose()
  newValue: string;

  @Expose()
  timestamp: Date;
}
