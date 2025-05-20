import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  ValidationPipe,
  Body,
  Post,
  Headers
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { ReportsService } from '../services/report.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('equipment/export')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  async exportEquipmentReport(
    @Body() params: any,
    @Res() res: Response,
    @Headers('user-agent') userAgent: string,
  ) {
    const buffer = await this.reportsService.generateEquipmentReport(params);

    const filename = `equipment_report_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', buffer.length);

    res.end(buffer);
  }

  @Post('requests/export')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  async exportRequestsReport(
    @Body() params: any,
    @Res() res: Response,
    @Headers('user-agent') userAgent: string,
  ) {
    const buffer = await this.reportsService.generateRequestsReport(params);

    const filename = `requests_report_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', buffer.length);

    res.end(buffer);
  }
}
