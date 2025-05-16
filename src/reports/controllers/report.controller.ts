import { Controller, Get, Post, Body, UseGuards, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { ReportService } from '../services/report.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('equipment')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  async getEquipmentReport(@Query() params: any) {
    return this.reportService.generateEquipmentReport(params);
  }

  @Get('requests')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  async getRequestReport(@Query() params: any) {
    return this.reportService.generateRequestReport(params);
  }

  @Post('export/equipment')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  async exportEquipmentReport(@Body() params: any, @Res() res: Response) {
    const buffer = await this.reportService.exportEquipmentReport(params);

    const filename = `equipment_report_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Post('export/requests')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  async exportRequestReport(@Body() params: any, @Res() res: Response) {
    const buffer = await this.reportService.exportRequestReport(params);

    const filename = `request_report_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}