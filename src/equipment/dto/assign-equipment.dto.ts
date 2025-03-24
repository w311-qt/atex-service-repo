import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignEquipmentDto {
  @IsUUID()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;
}
