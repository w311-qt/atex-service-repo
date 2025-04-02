import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Request } from '../entities/request.entity';
import { RequestActivity, ActivityType } from '../entities/request-activity.entity';
import { RequestStatus } from '../entities/request-status.entity';
import { CreateRequestDto } from '../dto/create-request.dto';
import { UpdateRequestDto } from '../dto/update-request.dto';
import { RequestFilterDto } from '../dto/request-filter.dto';
import { RequestResponseDto } from '../dto/request-response.dto';
import { RequestActivityResponseDto } from '../dto/request-activity-response.dto';
import {
  ChangeStatusDto,
  AssignRequestDto,
  AddCommentDto,
  CompleteRequestDto,
  CancelRequestDto,
} from '../dto/request-operations.dto';
import { UsersService } from '../../users/users.service';
import { User, UserRole } from '../../users/entities/user.entity';
import { EquipmentService } from '../../equipment/services/equipment.service';

@Injectable()
export class RequestService {
  private readonly logger = new Logger(RequestService.name);

  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(RequestActivity)
    private activityRepository: Repository<RequestActivity>,
    @InjectRepository(RequestStatus)
    private statusRepository: Repository<RequestStatus>,
    private usersService: UsersService,
    private equipmentService: EquipmentService,
  ) {}

  async findAll(
    filterDto: RequestFilterDto,
    currentUser: User,
  ): Promise<{ data: RequestResponseDto[]; total: number; page: number; limit: number }> {
    const {
      search,
      typeId,
      typeIds,
      statusId,
      statusIds,
      priorityId,
      priorityIds,
      createdById,
      assignedToId,
      equipmentId,
      cartridgeModel,
      location,
      createdFromDate,
      createdToDate,
      completedFromDate,
      completedToDate,
    } = filterDto;

    // Ensure page and limit have default values
    const page = filterDto.page ?? 1;
    const limit = filterDto.limit ?? 10;
    const sortBy = filterDto.sortBy ?? 'createdAt';
    const order = filterDto.order ?? 'DESC';

    // Build query
    const queryBuilder = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.type', 'type')
      .leftJoinAndSelect('request.status', 'status')
      .leftJoinAndSelect('request.priority', 'priority')
      .leftJoinAndSelect('request.createdBy', 'createdBy')
      .leftJoinAndSelect('request.assignedTo', 'assignedTo')
      .leftJoinAndSelect('request.equipment', 'equipment');

    // Apply role-based restrictions
    if (currentUser.role === UserRole.USER) {
      // Regular users can only see their own requests
      queryBuilder.andWhere('request.createdById = :userId', { userId: currentUser.id });
    } else if (currentUser.role === UserRole.TECHNICIAN) {
      // Technicians can see their assigned requests and unassigned requests
      queryBuilder.andWhere('(request.assignedToId = :techId OR request.assignedToId IS NULL)', {
        techId: currentUser.id,
      });
    }
    // Admins can see all requests (no additional filters)

    // Apply type filters
    if (typeId) {
      queryBuilder.andWhere('request.typeId = :typeId', { typeId });
    }
    if (typeIds && typeIds.length > 0) {
      queryBuilder.andWhere('request.typeId IN (:...typeIds)', { typeIds });
    }

    // Apply status filters
    if (statusId) {
      queryBuilder.andWhere('request.statusId = :statusId', { statusId });
    }
    if (statusIds && statusIds.length > 0) {
      queryBuilder.andWhere('request.statusId IN (:...statusIds)', { statusIds });
    }

    // Apply priority filters
    if (priorityId) {
      queryBuilder.andWhere('request.priorityId = :priorityId', { priorityId });
    }
    if (priorityIds && priorityIds.length > 0) {
      queryBuilder.andWhere('request.priorityId IN (:...priorityIds)', { priorityIds });
    }

    // Apply user filters
    if (createdById) {
      queryBuilder.andWhere('request.createdById = :createdById', { createdById });
    }
    if (assignedToId) {
      if (assignedToId === 'unassigned') {
        // Special case for filtering unassigned requests
        queryBuilder.andWhere('request.assignedToId IS NULL');
      } else {
        queryBuilder.andWhere('request.assignedToId = :assignedToId', { assignedToId });
      }
    }

    // Apply equipment filter
    if (equipmentId) {
      queryBuilder.andWhere('request.equipmentId = :equipmentId', { equipmentId });
    }

    // Apply cartridge model filter
    if (cartridgeModel) {
      queryBuilder.andWhere('request.cartridgeModel ILIKE :cartridgeModel', {
        cartridgeModel: `%${cartridgeModel}%`,
      });
    }

    // Apply location filter
    if (location) {
      queryBuilder.andWhere('request.location ILIKE :location', { location: `%${location}%` });
    }

    // Apply date filters
    if (createdFromDate) {
      queryBuilder.andWhere('request.createdAt >= :createdFromDate', { createdFromDate });
    }
    if (createdToDate) {
      queryBuilder.andWhere('request.createdAt <= :createdToDate', { createdToDate });
    }
    if (completedFromDate) {
      queryBuilder.andWhere('request.completedAt >= :completedFromDate', { completedFromDate });
    }
    if (completedToDate) {
      queryBuilder.andWhere('request.completedAt <= :completedToDate', { completedToDate });
    }

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(request.number ILIKE :search OR request.title ILIKE :search OR request.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`request.${sortBy}`, order);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [requests, total] = await queryBuilder.getManyAndCount();

    return {
      data: requests.map((request) =>
        plainToInstance(RequestResponseDto, request, { excludeExtraneousValues: true }),
      ),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, currentUser: User): Promise<RequestResponseDto> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['type', 'status', 'priority', 'createdBy', 'assignedTo', 'equipment'],
    });

    if (!request) {
      throw new NotFoundException(`Request with ID "${id}" not found`);
    }

    // Check if user has permission to view this request
    if (!this.canUserAccessRequest(request, currentUser)) {
      throw new ForbiddenException('You do not have permission to access this request');
    }

    return plainToInstance(RequestResponseDto, request, { excludeExtraneousValues: true });
  }

  async create(createRequestDto: CreateRequestDto, currentUser: User): Promise<RequestResponseDto> {
    // Get default "New" status
    const newStatus = await this.statusRepository.findOne({ where: { name: 'Новая' } });
    if (!newStatus) {
      throw new BadRequestException('Default status "New" not found');
    }

    // Validate equipment if provided
    if (createRequestDto.equipmentId) {
      await this.equipmentService.findOne(createRequestDto.equipmentId);
    }

    // Generate request number based on current year and sequential counter
    const currentYear = new Date().getFullYear();
    const latestRequest = await this.requestRepository
      .createQueryBuilder('request')
      .where('request.number LIKE :yearPrefix', { yearPrefix: `REQ-${currentYear}-%` })
      .orderBy('request.number', 'DESC')
      .getOne();

    let sequentialNumber = 1;
    if (latestRequest) {
      const parts = latestRequest.number.split('-');
      if (parts.length === 3) {
        sequentialNumber = parseInt(parts[2], 10) + 1;
      }
    }

    const requestNumber = `REQ-${currentYear}-${String(sequentialNumber).padStart(4, '0')}`;

    // Create new request
    const request = this.requestRepository.create({
      ...createRequestDto,
      number: requestNumber,
      statusId: newStatus.id,
      createdById: currentUser.id,
    });

    const savedRequest = await this.requestRepository.save(request);

    // Log activity
    await this.logActivity(
      savedRequest.id,
      currentUser.id,
      ActivityType.CREATE,
      'Request created',
      null,
      null,
    );

    // Return created request with relations
    return this.findOne(savedRequest.id, currentUser);
  }

  async update(
    id: string,
    updateRequestDto: UpdateRequestDto,
    currentUser: User,
  ): Promise<RequestResponseDto> {
    const request = await this.findOneEntity(id);

    // Check if user has permission to update this request
    if (!this.canUserModifyRequest(request, currentUser)) {
      throw new ForbiddenException('You do not have permission to update this request');
    }

    // Check if request is in a terminal state (completed or canceled)
    if (request.status?.name === 'Выполнена' || request.status?.name === 'Отменена') {
      throw new BadRequestException(
        'Cannot update a request that is already completed or canceled',
      );
    }

    // Validate equipment if provided
    if (updateRequestDto.equipmentId && updateRequestDto.equipmentId !== request.equipmentId) {
      await this.equipmentService.findOne(updateRequestDto.equipmentId);
    }

    // Store old values for logging
    const oldValues = { ...request };

    // Apply updates
    Object.assign(request, updateRequestDto);
    const updatedRequest = await this.requestRepository.save(request);

    // Log activity
    await this.logActivity(
      updatedRequest.id,
      currentUser.id,
      ActivityType.UPDATE,
      'Request updated',
      JSON.stringify(oldValues),
      JSON.stringify(updateRequestDto),
    );

    // Return updated request with relations
    return this.findOne(updatedRequest.id, currentUser);
  }

  async changeStatus(
    id: string,
    changeStatusDto: ChangeStatusDto,
    currentUser: User,
  ): Promise<RequestResponseDto> {
    const request = await this.findOneEntity(id, ['status']);

    // Check if user has permission to modify this request
    if (!this.canUserModifyRequest(request, currentUser)) {
      throw new ForbiddenException(
        'You do not have permission to change the status of this request',
      );
    }

    // Get current and new status
    const oldStatus = request.status;
    const newStatus = await this.statusRepository.findOne({
      where: { id: changeStatusDto.statusId },
    });

    if (!newStatus) {
      throw new NotFoundException(`Status with ID "${changeStatusDto.statusId}" not found`);
    }

    // Check if status transition is allowed
    if (!this.isStatusTransitionAllowed(oldStatus.name, newStatus.name)) {
      throw new BadRequestException(
        `Cannot change status from "${oldStatus.name}" to "${newStatus.name}"`,
      );
    }

    // Update status
    request.statusId = newStatus.id;

    // If status is changing to Completed, set completedAt
    if (newStatus.name === 'Выполнена' && !request.completedAt) {
      request.completedAt = new Date();
    }

    const updatedRequest = await this.requestRepository.save(request);

    // Log activity
    await this.logActivity(
      updatedRequest.id,
      currentUser.id,
      ActivityType.STATUS_CHANGE,
      changeStatusDto.comment || `Status changed from ${oldStatus.name} to ${newStatus.name}`,
      oldStatus.name,
      newStatus.name,
    );

    // Return updated request with relations
    return this.findOne(updatedRequest.id, currentUser);
  }

  async assign(
    id: string,
    assignRequestDto: AssignRequestDto,
    currentUser: User,
  ): Promise<RequestResponseDto> {
    const request = await this.findOneEntity(id, ['status']);

    // Only admins can assign requests
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can assign requests');
    }

    // Check if request is in a terminal state
    if (request.status?.name === 'Выполнена' || request.status?.name === 'Отменена') {
      throw new BadRequestException(
        'Cannot assign a request that is already completed or canceled',
      );
    }

    // If userId is null, it means we're unassigning
    let targetUser = null;
    if (assignRequestDto.userId) {
      // Validate user exists and is a technician
      targetUser = await this.usersService.findOne(assignRequestDto.userId);
      if (targetUser.role !== UserRole.TECHNICIAN) {
        throw new BadRequestException('Requests can only be assigned to technicians');
      }
    }

    // Store old assignee for logging
    const oldAssigneeId = request.assignedToId;
    let oldAssigneeName = 'Unassigned';
    let newAssigneeName = 'Unassigned';

    if (oldAssigneeId) {
      try {
        const oldUser = await this.usersService.findOne(oldAssigneeId);
        oldAssigneeName = oldUser.name;
      } catch (error) {
        // If user not found, keep default value
      }
    }

    if (targetUser) {
      newAssigneeName = targetUser.name;
    }

    // Update assignee
    request.assignedToId = assignRequestDto.userId || null;

    // If we're assigning and status is New, change to In Progress
    if (assignRequestDto.userId && request.status?.name === 'Новая') {
      const inProgressStatus = await this.statusRepository.findOne({
        where: { name: 'В работе' },
      });
      if (inProgressStatus) {
        request.statusId = inProgressStatus.id;
      }
    }

    // If we're unassigning and status is In Progress, change to New
    if (!assignRequestDto.userId && request.status?.name === 'В работе') {
      const newStatus = await this.statusRepository.findOne({
        where: { name: 'Новая' },
      });
      if (newStatus) {
        request.statusId = newStatus.id;
      }
    }

    const updatedRequest = await this.requestRepository.save(request);

    // Log activity
    await this.logActivity(
      updatedRequest.id,
      currentUser.id,
      ActivityType.ASSIGN,
      assignRequestDto.comment ||
        `Request ${assignRequestDto.userId ? 'assigned to' : 'unassigned from'} ${newAssigneeName}`,
      oldAssigneeName,
      newAssigneeName,
    );

    // Return updated request with relations
    return this.findOne(updatedRequest.id, currentUser);
  }

  async addComment(
    id: string,
    addCommentDto: AddCommentDto,
    currentUser: User,
  ): Promise<RequestActivityResponseDto> {
    const request = await this.findOneEntity(id);

    // Check if user has permission to access this request
    if (!this.canUserAccessRequest(request, currentUser)) {
      throw new ForbiddenException('You do not have permission to comment on this request');
    }

    // Create comment activity
    const activity = await this.logActivity(
      request.id,
      currentUser.id,
      ActivityType.COMMENT,
      addCommentDto.comment,
      null,
      null,
    );

    return plainToInstance(RequestActivityResponseDto, activity, { excludeExtraneousValues: true });
  }

  async complete(
    id: string,
    completeRequestDto: CompleteRequestDto,
    currentUser: User,
  ): Promise<RequestResponseDto> {
    const request = await this.findOneEntity(id, ['status']);

    // Check if user has permission to complete this request
    if (!this.canUserModifyRequest(request, currentUser)) {
      throw new ForbiddenException('You do not have permission to complete this request');
    }

    // Check if request is already in a terminal state
    if (request.status?.name === 'Выполнена' || request.status?.name === 'Отменена') {
      throw new BadRequestException(
        'Cannot complete a request that is already completed or canceled',
      );
    }

    // Find the "Completed" status
    const completedStatus = await this.statusRepository.findOne({
      where: { name: 'Выполнена' },
    });
    if (!completedStatus) {
      throw new BadRequestException('Status "Completed" not found');
    }

    // Store old status for logging
    const oldStatus = request.status;

    // Update request
    request.statusId = completedStatus.id;
    request.completedAt = new Date();

    const updatedRequest = await this.requestRepository.save(request);

    // Log activity
    await this.logActivity(
      updatedRequest.id,
      currentUser.id,
      ActivityType.COMPLETE,
      completeRequestDto.resolutionComment || 'Request completed',
      oldStatus.name,
      completedStatus.name,
    );

    // Return updated request with relations
    return this.findOne(updatedRequest.id, currentUser);
  }

  async cancel(
    id: string,
    cancelRequestDto: CancelRequestDto,
    currentUser: User,
  ): Promise<RequestResponseDto> {
    const request = await this.findOneEntity(id, ['status']);

    // Check if user has permission to cancel this request
    if (!this.canUserModifyRequest(request, currentUser)) {
      throw new ForbiddenException('You do not have permission to cancel this request');
    }

    // Check if request is already in a terminal state
    if (request.status?.name === 'Выполнена' || request.status?.name === 'Отменена') {
      throw new BadRequestException(
        'Cannot cancel a request that is already completed or canceled',
      );
    }

    // Find the "Canceled" status
    const canceledStatus = await this.statusRepository.findOne({
      where: { name: 'Отменена' },
    });
    if (!canceledStatus) {
      throw new BadRequestException('Status "Canceled" not found');
    }

    // Store old status for logging
    const oldStatus = request.status;

    // Update request
    request.statusId = canceledStatus.id;

    const updatedRequest = await this.requestRepository.save(request);

    // Log activity
    await this.logActivity(
      updatedRequest.id,
      currentUser.id,
      ActivityType.CANCEL,
      `Request canceled: ${cancelRequestDto.reason}`,
      oldStatus.name,
      canceledStatus.name,
    );

    // Return updated request with relations
    return this.findOne(updatedRequest.id, currentUser);
  }

  async getActivities(id: string, currentUser: User): Promise<RequestActivityResponseDto[]> {
    const request = await this.findOneEntity(id);

    // Check if user has permission to access this request
    if (!this.canUserAccessRequest(request, currentUser)) {
      throw new ForbiddenException(
        'You do not have permission to view activities for this request',
      );
    }

    const activities = await this.activityRepository.find({
      where: { requestId: id },
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });

    return activities.map((activity) =>
      plainToInstance(RequestActivityResponseDto, activity, { excludeExtraneousValues: true }),
    );
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const request = await this.findOneEntity(id);

    // Only admins can delete requests
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can delete requests');
    }

    await this.requestRepository.remove(request);
    this.logger.log(`Request deleted: ${id}`);
  }

  // Helper methods

  private async findOneEntity(id: string, relations: string[] = []): Promise<Request> {
    const queryOptions: any = {
      where: { id },
    };

    if (relations.length > 0) {
      queryOptions.relations = relations;
    }

    const request = await this.requestRepository.findOne(queryOptions);

    if (!request) {
      throw new NotFoundException(`Request with ID "${id}" not found`);
    }

    return request;
  }

  private async logActivity(
    requestId: string,
    userId: string,
    type: ActivityType,
    message: string,
    oldValue: string | null,
    newValue: string | null,
  ): Promise<RequestActivity> {
    const activity = this.activityRepository.create({
      requestId,
      userId,
      type,
      message,
      oldValue,
      newValue,
    });

    return this.activityRepository.save(activity);
  }

  private canUserAccessRequest(request: Request, user: User): boolean {
    // Admins can access all requests
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Technicians can access their assigned requests and unassigned requests
    if (user.role === UserRole.TECHNICIAN) {
      return request.assignedToId === user.id || request.assignedToId === null;
    }

    // Regular users can only access their own requests
    return request.createdById === user.id;
  }

  private canUserModifyRequest(request: Request, user: User): boolean {
    // Admins can modify all requests
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Technicians can only modify their assigned requests
    if (user.role === UserRole.TECHNICIAN) {
      return request.assignedToId === user.id;
    }

    // Regular users can only modify their own requests if they are not assigned to a technician
    if (user.role === UserRole.USER) {
      return request.createdById === user.id && request.assignedToId === null;
    }

    return false;
  }

  private isStatusTransitionAllowed(oldStatus: string, newStatus: string): boolean {
    // Define allowed transitions
    const allowedTransitions: Record<string, string[]> = {
      Новая: ['В работе', 'Отменена'],
      'В работе': ['Ожидает', 'Выполнена', 'Отменена'],
      Ожидает: ['В работе', 'Выполнена', 'Отменена'],
      Выполнена: [], // No transitions from Completed
      Отменена: [], // No transitions from Canceled
    };

    // Check if transition is allowed
    return allowedTransitions[oldStatus]?.includes(newStatus) || false;
  }
}
