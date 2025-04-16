import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestController } from './controllers/request.controller';
import { RequestStatusController } from './controllers/request-status.controller';
import { RequestTypeController } from './controllers/request-type.controller';
import { RequestPriorityController } from './controllers/request-priority.controller';
import { RequestActivityController } from './controllers/request-activity.controller';
import { RequestStatisticsController } from './controllers/request-statistics.controller';
import { RequestService } from './services/request.service';
import { RequestStatusService } from './services/request-status.service';
import { RequestTypeService } from './services/request-type.service';
import { RequestPriorityService } from './services/request-priority.service';
import { RequestActivityService } from './services/request-activity.service';
import { RequestStatisticsService } from './services/request-statistics.service';
import { Request } from './entities/request.entity';
import { RequestStatus } from './entities/request-status.entity';
import { RequestType } from './entities/request-type.entity';
import { RequestPriority } from './entities/request-priority.entity';
import { RequestActivity } from './entities/request-activity.entity';
import { UsersModule } from '../users/users.module';
import { EquipmentModule } from '../equipment/equipment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Request,
      RequestStatus,
      RequestType,
      RequestPriority,
      RequestActivity,
    ]),
    UsersModule,
    EquipmentModule,
  ],
  controllers: [
    RequestController,
    RequestStatusController,
    RequestTypeController,
    RequestPriorityController,
    RequestActivityController,
    RequestStatisticsController,
  ],
  providers: [
    RequestService,
    RequestStatusService,
    RequestTypeService,
    RequestPriorityService,
    RequestActivityService,
    RequestStatisticsService,
  ],
  exports: [RequestService],
})
export class RequestsModule {}
