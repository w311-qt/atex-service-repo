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
import { RequestPriorityService } from '../services/request-priority.service';
import { CreateRequestPriorityDto } from '../dto/create-request-priority.dto';
import { UpdateRequestPriorityDto } from '../dto/update-request-priority.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('request-priorities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestPriorityController {
  constructor(private readonly requestPriorityService: RequestPriorityService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createRequestPriorityDto: CreateRequestPriorityDto) {
    return this.requestPriorityService.create(createRequestPriorityDto);
  }

  @Get()
  findAll() {
    return this.requestPriorityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestPriorityService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateRequestPriorityDto: UpdateRequestPriorityDto) {
    return this.requestPriorityService.update(id, updateRequestPriorityDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.requestPriorityService.remove(id);
  }
}
