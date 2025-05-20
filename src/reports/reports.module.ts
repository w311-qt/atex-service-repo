import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './controllers/report.controller';
import { ReportsService } from './services/report.service';
import { Equipment } from '../equipment/entities/equipment.entity';
import { Category } from '../equipment/entities/category.entity';
import { Status } from '../equipment/entities/status.entity';
import { User } from '../users/entities/user.entity';
import { Request } from '../requests/entities/request.entity';
import { RequestStatus } from '../requests/entities/request-status.entity';
import { RequestType } from '../requests/entities/request-type.entity';
import { RequestPriority } from '../requests/entities/request-priority.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Equipment,
      Category,
      Status,
      User,
      Request,
      RequestStatus,
      RequestType,
      RequestPriority
    ])
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
