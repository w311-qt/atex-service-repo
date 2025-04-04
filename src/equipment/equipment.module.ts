import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentController } from './controllers/equipment.controller';
import { CategoryController } from './controllers/category.controller';
import { StatusController } from './controllers/status.controller';
import { SpecificationController } from './controllers/specification.controller';
import { EquipmentService } from './services/equipment.service';
import { CategoryService } from './services/category.service';
import { StatusService } from './services/status.service';
import { SpecificationService } from './services/specification.service';
import { Equipment } from './entities/equipment.entity';
import { Category } from './entities/category.entity';
import { Status } from './entities/status.entity';
import { EquipmentSpecification } from './entities/equipment-specification.entity';
import { UsersModule } from '../users/users.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Equipment, Category, Status, EquipmentSpecification]),
    UsersModule,
    FileModule,
  ],
  controllers: [EquipmentController, CategoryController, StatusController, SpecificationController],
  providers: [EquipmentService, CategoryService, StatusService, SpecificationService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
