import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RequestService } from '../services/request.service';
import { CreateRequestDto } from '../dto/create-request.dto';
import { UpdateRequestDto } from '../dto/update-request.dto';
import { RequestFilterDto } from '../dto/request-filter.dto';
import {
  ChangeStatusDto,
  AssignRequestDto,
  AddCommentDto,
  CompleteRequestDto,
  CancelRequestDto,
} from '../dto/request-operations.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.TECHNICIAN)
  create(@Body() createRequestDto: CreateRequestDto, @CurrentUser() user: User) {
    return this.requestService.create(createRequestDto, user);
  }

  @Get()
  findAll(@Query() filterDto: RequestFilterDto, @CurrentUser() user: User) {
    return this.requestService.findAll(filterDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.requestService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.USER)
  update(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @CurrentUser() user: User,
  ) {
    return this.requestService.update(id, updateRequestDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.requestService.remove(id, user);
  }

  @Post(':id/status')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.requestService.changeStatus(id, changeStatusDto, user);
  }

  @Post(':id/assign')
  @Roles(UserRole.ADMIN)
  assignRequest(
    @Param('id') id: string,
    @Body() assignRequestDto: AssignRequestDto,
    @CurrentUser() user: User,
  ) {
    return this.requestService.assign(id, assignRequestDto, user);
  }

  @Post(':id/comment')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.USER)
  addComment(
    @Param('id') id: string,
    @Body() addCommentDto: AddCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.requestService.addComment(id, addCommentDto, user);
  }

  @Post(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  completeRequest(
    @Param('id') id: string,
    @Body() completeRequestDto: CompleteRequestDto,
    @CurrentUser() user: User,
  ) {
    return this.requestService.complete(id, completeRequestDto, user);
  }

  @Post(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.USER)
  cancelRequest(
    @Param('id') id: string,
    @Body() cancelRequestDto: CancelRequestDto,
    @CurrentUser() user: User,
  ) {
    return this.requestService.cancel(id, cancelRequestDto, user);
  }

  @Get(':id/activities')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.USER)
  getActivities(@Param('id') id: string, @CurrentUser() user: User) {
    return this.requestService.getActivities(id, user);
  }
}
