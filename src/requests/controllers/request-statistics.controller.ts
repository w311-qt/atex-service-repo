import { Controller, Get, UseGuards } from '@nestjs/common';
import { RequestStatisticsService } from '../services/request-statistics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('request-statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestStatisticsController {
  constructor(private readonly statisticsService: RequestStatisticsService) {}

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  getOverallStatistics() {
    return this.statisticsService.getOverallStatistics();
  }

  @Get('resolution-time')
  @Roles(UserRole.ADMIN)
  getResolutionTimeStatistics() {
    return this.statisticsService.getResolutionTimeStatistics();
  }

  @Get('technician-workload')
  @Roles(UserRole.ADMIN)
  getTechnicianWorkloadStatistics() {
    return this.statisticsService.getTechnicianWorkloadStatistics();
  }

  @Get('trends')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  getRequestTrendStatistics() {
    return this.statisticsService.getRequestTrendStatistics();
  }
}
