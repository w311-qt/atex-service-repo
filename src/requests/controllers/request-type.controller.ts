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
import { RequestTypeService } from '../services/request-type.service';
import { CreateRequestTypeDto } from '../dto/create-request-type.dto';
import { UpdateRequestTypeDto } from '../dto/update-request-type.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('request-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestTypeController {
  constructor(private readonly requestTypeService: RequestTypeService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createRequestTypeDto: CreateRequestTypeDto) {
    return this.requestTypeService.create(createRequestTypeDto);
  }

  @Get()
  findAll() {
    return this.requestTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestTypeService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateRequestTypeDto: UpdateRequestTypeDto) {
    return this.requestTypeService.update(id, updateRequestTypeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.requestTypeService.remove(id);
  }
}
