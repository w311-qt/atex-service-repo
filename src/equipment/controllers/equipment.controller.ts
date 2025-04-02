import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  PayloadTooLargeException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { EquipmentService } from '../services/equipment.service';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';
import { EquipmentFilterDto } from '../dto/equipment-filter.dto';
import { AssignEquipmentDto } from '../dto/assign-equipment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('equipment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentService.create(createEquipmentDto);
  }

  @Get()
  findAll(@Query() filterDto: EquipmentFilterDto) {
    return this.equipmentService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  update(@Param('id') id: string, @Body() updateEquipmentDto: UpdateEquipmentDto) {
    return this.equipmentService.update(id, updateEquipmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(id);
  }

  @Post(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  assignToUser(@Param('id') id: string, @Body() assignDto: AssignEquipmentDto) {
    return this.equipmentService.assignToUser(id, assignDto);
  }

  @Post(':id/image')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          exceptionFactory: (error) => {
            if (error.includes('file size')) {
              return new PayloadTooLargeException('File is too large (max 5MB)');
            }
            return error;
          },
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.equipmentService.uploadImage(id, file.filename);
  }
  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  getStatistics() {
    return this.equipmentService.getStatistics();
  }
}
