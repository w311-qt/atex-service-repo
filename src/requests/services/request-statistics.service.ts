import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from '../entities/request.entity';
import { RequestActivity } from '../entities/request-activity.entity';

@Injectable()
export class RequestStatisticsService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(RequestActivity)
    private activityRepository: Repository<RequestActivity>,
  ) {}

  /**
   * Get overall statistics about requests
   */
  async getOverallStatistics(): Promise<any> {
    // Get counts by status
    const statusStats = await this.requestRepository
      .createQueryBuilder('request')
      .select('status.name', 'status')
      .addSelect('COUNT(request.id)', 'count')
      .leftJoin('request.status', 'status')
      .groupBy('status.name')
      .getRawMany();

    // Get counts by type
    const typeStats = await this.requestRepository
      .createQueryBuilder('request')
      .select('type.name', 'type')
      .addSelect('COUNT(request.id)', 'count')
      .leftJoin('request.type', 'type')
      .groupBy('type.name')
      .getRawMany();

    // Get counts by priority
    const priorityStats = await this.requestRepository
      .createQueryBuilder('request')
      .select('priority.name', 'priority')
      .addSelect('COUNT(request.id)', 'count')
      .leftJoin('request.priority', 'priority')
      .groupBy('priority.name')
      .getRawMany();

    // Get assigned vs unassigned
    const assignmentStats = await this.requestRepository
      .createQueryBuilder('request')
      .select('CASE WHEN request.assignedToId IS NULL THEN \'Unassigned\' ELSE \'Assigned\' END', 'assignment')
      .addSelect('COUNT(request.id)', 'count')
      .groupBy('assignment')
      .getRawMany();

    // Monthly statistics for the current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await this.requestRepository
      .createQueryBuilder('request')
      .select('EXTRACT(MONTH FROM request.createdAt)', 'month')
      .addSelect('COUNT(request.id)', 'count')
      .where('EXTRACT(YEAR FROM request.createdAt) = :year', { year: currentYear })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      totalRequests: await this.requestRepository.count(),
      byStatus: statusStats,
      byType: typeStats,
      byPriority: priorityStats,
      byAssignment: assignmentStats,
      monthlyTrends: monthlyStats,
    };
  }

  /**
   * Get resolution time statistics
   */
  async getResolutionTimeStatistics(): Promise<any> {
    // Average resolution time (in hours) by priority
    const resolutionByPriority = await this.requestRepository
      .createQueryBuilder('request')
      .select('priority.name', 'priority')
      .addSelect('AVG(EXTRACT(EPOCH FROM (request.completedAt - request.createdAt)) / 3600)', 'averageHours')
      .leftJoin('request.priority', 'priority')
      .where('request.completedAt IS NOT NULL')
      .groupBy('priority.name')
      .orderBy('averageHours', 'DESC')
      .getRawMany();

    // Average resolution time by type
    const resolutionByType = await this.requestRepository
      .createQueryBuilder('request')
      .select('type.name', 'type')
      .addSelect('AVG(EXTRACT(EPOCH FROM (request.completedAt - request.createdAt)) / 3600)', 'averageHours')
      .leftJoin('request.type', 'type')
      .where('request.completedAt IS NOT NULL')
      .groupBy('type.name')
      .orderBy('averageHours', 'DESC')
      .getRawMany();

    // Average resolution time by technician
    const resolutionByTechnician = await this.requestRepository
      .createQueryBuilder('request')
      .select('assignedTo.name', 'technician')
      .addSelect('AVG(EXTRACT(EPOCH FROM (request.completedAt - request.createdAt)) / 3600)', 'averageHours')
      .addSelect('COUNT(request.id)', 'count')
      .leftJoin('request.assignedTo', 'assignedTo')
      .where('request.completedAt IS NOT NULL')
      .andWhere('request.assignedToId IS NOT NULL')
      .groupBy('assignedTo.name')
      .orderBy('averageHours', 'ASC')
      .getRawMany();

    return {
      byPriority: resolutionByPriority,
      byType: resolutionByType,
      byTechnician: resolutionByTechnician,
    };
  }

  /**
   * Get technician workload statistics
   */
  async getTechnicianWorkloadStatistics(): Promise<any> {
    // Current workload (assigned but not completed)
    const currentWorkload = await this.requestRepository
      .createQueryBuilder('request')
      .select('assignedTo.name', 'technician')
      .addSelect('COUNT(request.id)', 'count')
      .leftJoin('request.assignedTo', 'assignedTo')
      .where('request.completedAt IS NULL')
      .andWhere('request.assignedToId IS NOT NULL')
      .groupBy('assignedTo.name')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Historical workload (total completed)
    const historicalWorkload = await this.requestRepository
      .createQueryBuilder('request')
      .select('assignedTo.name', 'technician')
      .addSelect('COUNT(request.id)', 'count')
      .leftJoin('request.assignedTo', 'assignedTo')
      .where('request.completedAt IS NOT NULL')
      .andWhere('request.assignedToId IS NOT NULL')
      .groupBy('assignedTo.name')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Workload by request type
    const workloadByType = await this.requestRepository
      .createQueryBuilder('request')
      .select('assignedTo.name', 'technician')
      .addSelect('type.name', 'type')
      .addSelect('COUNT(request.id)', 'count')
      .leftJoin('request.assignedTo', 'assignedTo')
      .leftJoin('request.type', 'type')
      .where('request.assignedToId IS NOT NULL')
      .groupBy('assignedTo.name, type.name')
      .orderBy('technician', 'ASC')
      .addOrderBy('count', 'DESC')
      .getRawMany();

    return {
      current: currentWorkload,
      historical: historicalWorkload,
      byType: workloadByType,
    };
  }

  /**
   * Get request trend statistics
   */
  async getRequestTrendStatistics(): Promise<any> {
    // Requests by day of week
    const dayOfWeekStats = await this.requestRepository
      .createQueryBuilder('request')
      .select('EXTRACT(DOW FROM request.createdAt)', 'dayOfWeek')
      .addSelect('COUNT(request.id)', 'count')
      .groupBy('dayOfWeek')
      .orderBy('dayOfWeek', 'ASC')
      .getRawMany();

    // Requests by hour of day
    const hourOfDayStats = await this.requestRepository
      .createQueryBuilder('request')
      .select('EXTRACT(HOUR FROM request.createdAt)', 'hourOfDay')
      .addSelect('COUNT(request.id)', 'count')
      .groupBy('hourOfDay')
      .orderBy('hourOfDay', 'ASC')
      .getRawMany();

    // Monthly trend for last 12 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const monthlyTrend = await this.requestRepository
      .createQueryBuilder('request')
      .select("TO_CHAR(request.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(request.id)', 'count')
      .where('request.createdAt >= :startDate', { startDate })
      .andWhere('request.createdAt <= :endDate', { endDate })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      byDayOfWeek: dayOfWeekStats,
      byHourOfDay: hourOfDayStats,
      monthlyTrend: monthlyTrend,
    };
  }
}
