import { IsArray, IsUUID } from 'class-validator';

export class BulkAssignEquipmentDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  equipmentIds: string[];

  @IsUUID()
  userId: string;
}

export class BulkStatusUpdateDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  equipmentIds: string[];

  @IsUUID()
  statusId: string;
}
