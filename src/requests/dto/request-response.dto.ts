import { Expose, Type } from 'class-transformer';
import { RequestType } from '../entities/request-type.entity';
import { RequestStatus } from '../entities/request-status.entity';
import { RequestPriority } from '../entities/request-priority.entity';
import { User } from '../../users/entities/user.entity';
import { Equipment } from '../../equipment/entities/equipment.entity';

export class RequestResponseDto {
  @Expose()
  id: string;

  @Expose()
  number: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  typeId: string;

  @Expose()
  @Type(() => RequestType)
  type: RequestType;

  @Expose()
  statusId: string;

  @Expose()
  @Type(() => RequestStatus)
  status: RequestStatus;

  @Expose()
  priorityId: string;

  @Expose()
  @Type(() => RequestPriority)
  priority: RequestPriority;

  @Expose()
  createdById: string;

  @Expose()
  @Type(() => User)
  createdBy: User;

  @Expose()
  assignedToId: string;

  @Expose()
  @Type(() => User)
  assignedTo: User;

  @Expose()
  equipmentId: string;

  @Expose()
  @Type(() => Equipment)
  equipment: Equipment;

  @Expose()
  cartridgeModel: string;

  @Expose()
  location: string;

  @Expose()
  completedAt: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
