import { Exclude, Expose, Type } from 'class-transformer';
import { Category } from '../entities/category.entity';
import { Status } from '../entities/status.entity';
import { User } from '../../users/entities/user.entity';

export class EquipmentResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  model: string;

  @Expose()
  inventoryNumber: string;

  @Expose()
  description: string;

  @Expose()
  image: string;

  @Expose()
  categoryId: string;

  @Expose()
  @Type(() => Category)
  category: Category;

  @Expose()
  statusId: string;

  @Expose()
  @Type(() => Status)
  status: Status;

  @Expose()
  assignedToId: string;

  @Expose()
  @Type(() => User)
  assignedTo: User;

  @Expose()
  location: string;

  @Expose()
  purchaseDate: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
