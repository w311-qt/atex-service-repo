import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RequestStatusService } from '../services/request-status.service';
import { CreateRequestStatusDto } from '../dto/create-request-status.dto';
import { UpdateRequestStatusDto } from '../dto/update-request-status.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('request-statuses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestStatusController {
  constructor(private readonly requestStatusService: RequestStatusService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createRequestStatusDto: CreateRequestStatusDto) {
    return this.requestStatusService.create(createRequestStatusDto);
  }

  @Get()
  findAll() {
    return this.requestStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestStatusService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateRequestStatusDto: UpdateRequestStatusDto) {
    return this.requestStatusService.update(id, updateRequestStatusDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.requestStatusService.remove(id);
  }
}
