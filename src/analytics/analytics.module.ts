import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Equipment } from '../equipment/entities/equipment.entity';
import { Request } from '../requests/entities/request.entity';
import { EquipmentModule } from '../equipment/equipment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Equipment, Request]),
    EquipmentModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
