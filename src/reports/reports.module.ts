import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './controllers/report.controller';
import { ReportService } from './services/report.service';
import { ExcelService } from './services/excel.service';
import { Equipment } from '../equipment/entities/equipment.entity';
import { Category } from '../equipment/entities/category.entity';
import { Status } from '../equipment/entities/status.entity';
import { Request } from '../requests/entities/request.entity';
import { RequestStatus } from '../requests/entities/request-status.entity';
import { RequestType } from '../requests/entities/request-type.entity';
import { RequestPriority } from '../requests/entities/request-priority.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Equipment,
      Category,
      Status,
      Request,
      RequestStatus,
      RequestType,
      RequestPriority,
      User,
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService, ExcelService],
  exports: [ReportService],
})
export class ReportsModule {}