import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentController } from './controllers/equipment.controller';
import { CategoryController } from './controllers/category.controller';
import { StatusController } from './controllers/status.controller';
import { EquipmentService } from './services/equipment.service';
import { CategoryService } from './services/category.service';
import { StatusService } from './services/status.service';
import { Equipment } from './entities/equipment.entity';
import { Category } from './entities/category.entity';
import { Status } from './entities/status.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Equipment, Category, Status]),
    UsersModule, // We need this to inject UsersService
  ],
  controllers: [EquipmentController, CategoryController, StatusController],
  providers: [EquipmentService, CategoryService, StatusService],
  exports: [EquipmentService], // Export to be used in other modules (like Requests)
})
export class EquipmentModule {}
