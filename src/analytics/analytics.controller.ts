import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AnalyticsService } from './analytics.service';
import { EquipmentAnalyticsFilterDto } from './dto/equipment-analytics-filter.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('equipment/summary')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  getEquipmentSummary() {
    return this.analyticsService.getEquipmentSummary();
  }

  @Get('equipment/by-category')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  getEquipmentByCategory() {
    return this.analyticsService.getEquipmentByCategory();
  }

  @Get('equipment/by-status')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  getEquipmentByStatus() {
    return this.analyticsService.getEquipmentByStatus();
  }

  @Get('equipment/by-age')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  getEquipmentByAge() {
    return this.analyticsService.getEquipmentByAge();
  }

  @Get('equipment/by-location')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  getEquipmentByLocation() {
    return this.analyticsService.getEquipmentByLocation();
  }

  @Get('equipment/by-user')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  getEquipmentByUser() {
    return this.analyticsService.getEquipmentByUser();
  }

  @Get('equipment/dashboard')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  getEquipmentDashboard() {
    return this.analyticsService.getEquipmentDashboard();
  }
}
