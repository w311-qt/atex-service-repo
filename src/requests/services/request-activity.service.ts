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

  async findAllForRequest(requestId: string): Promise<RequestActivity[]> {
    const request = await this.requestRepository.findOne({ where: { id: requestId } });

    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }

    return this.requestActivityRepository.find({
      where: { requestId },
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });
  }

  async logActivity(
    requestId: string,
    userId: string,
    type: ActivityType,
    message: string,
    oldValue?: string,
    newValue?: string,
  ): Promise<RequestActivity> {
    const request = await this.requestRepository.findOne({ where: { id: requestId } });

    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }

    await this.usersService.findOne(userId);

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

  async getRecentActivities(limit: number = 10): Promise<RequestActivity[]> {
    return this.requestActivityRepository.find({
      relations: ['user', 'request'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getActivitiesByType(type: ActivityType, limit: number = 10): Promise<RequestActivity[]> {
    return this.requestActivityRepository.find({
      where: { type },
      relations: ['user', 'request'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getActivitiesByUser(userId: string, limit: number = 10): Promise<RequestActivity[]> {
    await this.usersService.findOne(userId);

    return this.requestActivityRepository.find({
      where: { userId },
      relations: ['request'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async searchActivities(
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: RequestActivity[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.requestActivityRepository.createQueryBuilder('activity');

    if (searchTerm) {
      queryBuilder.where('activity.message ILIKE :search', { search: `%${searchTerm}%` });
    }

    queryBuilder.leftJoinAndSelect('activity.user', 'user');
    queryBuilder.leftJoinAndSelect('activity.request', 'request');

    // queryBuilder.where('activity.timestamp', 'DESC);
    queryBuilder.orderBy('activity.timestamp', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [activities, total] = await queryBuilder.getManyAndCount();

    return {
      data: activities,
      total,
      page,
      limit,
    };
  }
}
