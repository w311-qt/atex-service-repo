import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestActivity, ActivityType } from '../entities/request-activity.entity';
import { Request } from '../entities/request.entity';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RequestActivityService {
  constructor(
    @InjectRepository(RequestActivity)
    private requestActivityRepository: Repository<RequestActivity>,
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    private usersService: UsersService,
  ) {}

  /**
   * Get all activities for a request
   */
  async findAllForRequest(requestId: string): Promise<RequestActivity[]> {
    // First check if the request exists
    const request = await this.requestRepository.findOne({ where: { id: requestId } });

    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }

    // Get all activities for the request, ordered by timestamp
    return this.requestActivityRepository.find({
      where: { requestId },
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Log an activity
   */
  async logActivity(
    requestId: string,
    userId: string,
    type: ActivityType,
    message: string,
    oldValue?: string,
    newValue?: string,
  ): Promise<RequestActivity> {
    // Check if request exists
    const request = await this.requestRepository.findOne({ where: { id: requestId } });

    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }

    // Check if user exists
    await this.usersService.findOne(userId);

    // Create activity
    const activity = this.requestActivityRepository.create({
      requestId,
      userId,
      type,
      message,
      oldValue,
      newValue,
      timestamp: new Date(),
    });

    return this.requestActivityRepository.save(activity);
  }

  /**
   * Get activity by ID
   */
  async findOne(id: string): Promise<RequestActivity> {
    const activity = await this.requestActivityRepository.findOne({
      where: { id },
      relations: ['user', 'request'],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }

  /**
   * Get recent activities across all requests
   */
  async getRecentActivities(limit: number = 10): Promise<RequestActivity[]> {
    return this.requestActivityRepository.find({
      relations: ['user', 'request'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get activities by type
   */
  async getActivitiesByType(type: ActivityType, limit: number = 10): Promise<RequestActivity[]> {
    return this.requestActivityRepository.find({
      where: { type },
      relations: ['user', 'request'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get activities by user
   */
  async getActivitiesByUser(userId: string, limit: number = 10): Promise<RequestActivity[]> {
    // Check if user exists
    await this.usersService.findOne(userId);

    return this.requestActivityRepository.find({
      where: { userId },
      relations: ['request'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Search activities
   */
  async searchActivities(
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: RequestActivity[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.requestActivityRepository.createQueryBuilder('activity');

    // Search in message
    if (searchTerm) {
      queryBuilder.where('activity.message ILIKE :search', { search: `%${searchTerm}%` });
    }

    // Add relations
    queryBuilder.leftJoinAndSelect('activity.user', 'user');
    queryBuilder.leftJoinAndSelect('activity.request', 'request');

    // Add ordering
    queryBuilder.orderBy('activity.timestamp', 'DESC');

    // Add pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute the query
    const [activities, total] = await queryBuilder.getManyAndCount();

    return {
      data: activities,
      total,
      page,
      limit,
    };
  }
}
