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
import { SpecificationService } from '../services/specification.service';
import { CreateSpecificationDto, UpdateSpecificationDto } from '../dto/specification.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('equipment/:equipmentId/specifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpecificationController {
  constructor(private readonly specificationService: SpecificationService) {}

  @Get()
  async findAll(@Param('equipmentId') equipmentId: string) {
    return await this.specificationService.findAllForEquipment(equipmentId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  async create(
    @Param('equipmentId') equipmentId: string,
    @Body() createSpecificationDto: CreateSpecificationDto,
  ) {
    return await this.specificationService.create(equipmentId, createSpecificationDto);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  async createMany(
    @Param('equipmentId') equipmentId: string,
    @Body() specifications: CreateSpecificationDto[],
  ) {
    return await this.specificationService.createMany(equipmentId, specifications);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.specificationService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  async update(@Param('id') id: string, @Body() updateSpecificationDto: UpdateSpecificationDto) {
    return await this.specificationService.update(id, updateSpecificationDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.specificationService.remove(id);
  }

  @Delete()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAll(@Param('equipmentId') equipmentId: string) {
    return await this.specificationService.removeAllForEquipment(equipmentId);
  }
}
