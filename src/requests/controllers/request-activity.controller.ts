import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RequestActivityService } from '../services/request-activity.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { ActivityType } from '../entities/request-activity.entity';

@Controller('request-activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestActivityController {
  constructor(private readonly requestActivityService: RequestActivityService) {}

  @Get('recent')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  getRecentActivities(@Query('limit') limit: number = 10) {
    return this.requestActivityService.getRecentActivities(limit);
  }

  @Get('by-type/:type')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  getActivitiesByType(@Param('type') type: ActivityType, @Query('limit') limit: number = 10) {
    return this.requestActivityService.getActivitiesByType(type, limit);
  }

  @Get('by-user/:userId')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  getActivitiesByUser(@Param('userId') userId: string, @Query('limit') limit: number = 10) {
    return this.requestActivityService.getActivitiesByUser(userId, limit);
  }

  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  searchActivities(
    @Query('search') search: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.requestActivityService.searchActivities(search, page, limit);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.requestActivityService.findOne(id);
  }
}
