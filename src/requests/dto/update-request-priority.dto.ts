import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestPriorityDto } from './create-request-priority.dto';

export class UpdateRequestPriorityDto extends PartialType(CreateRequestPriorityDto) {}
