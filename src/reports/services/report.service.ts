import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Equipment } from '../../equipment/entities/equipment.entity';
import { Category } from '../../equipment/entities/category.entity';
import { Status } from '../../equipment/entities/status.entity';
import { Request } from '../../requests/entities/request.entity';
import { RequestStatus } from '../../requests/entities/request-status.entity';
import { RequestType } from '../../requests/entities/request-type.entity';
import { RequestPriority } from '../../requests/entities/request-priority.entity';
import { User } from '../../users/entities/user.entity';
import { ExcelService } from './excel.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(RequestStatus)
    private requestStatusRepository: Repository<RequestStatus>,
    @InjectRepository(RequestType)
    private requestTypeRepository: Repository<RequestType>,
    @InjectRepository(RequestPriority)
    private requestPriorityRepository: Repository<RequestPriority>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private excelService: ExcelService,
  ) {}

  /**
   * Generate equipment report
   */
  async generateEquipmentReport(params: any) {
    const queryBuilder = this.equipmentRepository.createQueryBuilder('equipment')
      .leftJoinAndSelect('equipment.category', 'category')
      .leftJoinAndSelect('equipment.status', 'status')
      .leftJoinAndSelect('equipment.assignedTo', 'assignedTo');

    // Apply filters if provided
    if (params.categoryIds && params.categoryIds.length > 0) {
      queryBuilder.andWhere('equipment.categoryId IN (:...categoryIds)', {
        categoryIds: params.categoryIds,
      });
    }

    if (params.statusIds && params.statusIds.length > 0) {
      queryBuilder.andWhere('equipment.statusId IN (:...statusIds)', {
        statusIds: params.statusIds,
      });
    }

    if (params.dateFrom) {
      queryBuilder.andWhere('equipment.purchaseDate >= :dateFrom', {
        dateFrom: params.dateFrom,
      });
    }

    if (params.dateTo) {
      queryBuilder.andWhere('equipment.purchaseDate <= :dateTo', {
        dateTo: params.dateTo,
      });
    }

    const equipment = await queryBuilder.getMany();
    const total = equipment.length;

    // Group equipment by category
    const byCategory = await this.getEquipmentByCategory(equipment);

    // Group equipment by status
    const byStatus = await this.getEquipmentByStatus(equipment);

    // Group equipment by age
    const byAge = this.getEquipmentByAge(equipment);

    return {
      total,
      byCategory,
      byStatus,
      byAge,
      generatedAt: new Date()
    };
  }

  /**
   * Generate request report
   */
  async generateRequestReport(params: any) {
    const queryBuilder = this.requestRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.type', 'type')
      .leftJoinAndSelect('request.status', 'status')
      .leftJoinAndSelect('request.priority', 'priority')
      .leftJoinAndSelect('request.assignedTo', 'assignedTo')
      .leftJoinAndSelect('request.createdBy', 'createdBy')
      .leftJoinAndSelect('request.equipment', 'equipment');

    // Apply filters if provided
    if (params.statusIds && params.statusIds.length > 0) {
      queryBuilder.andWhere('request.statusId IN (:...statusIds)', {
        statusIds: params.statusIds,
      });
    }

    if (params.typeIds && params.typeIds.length > 0) {
      queryBuilder.andWhere('request.typeId IN (:...typeIds)', {
        typeIds: params.typeIds,
      });
    }

    if (params.assignedToIds && params.assignedToIds.length > 0) {
      queryBuilder.andWhere('request.assignedToId IN (:...assignedToIds)', {
        assignedToIds: params.assignedToIds,
      });
    }

    if (params.dateFrom) {
      queryBuilder.andWhere('request.createdAt >= :dateFrom', {
        dateFrom: params.dateFrom,
      });
    }

    if (params.dateTo) {
      queryBuilder.andWhere('request.createdAt <= :dateTo', {
        dateTo: params.dateTo,
      });
    }

    const requests = await queryBuilder.getMany();
    const total = requests.length;

    // Group requests by status
    const byStatus = await this.getRequestsByStatus(requests);

    // Group requests by type
    const byType = await this.getRequestsByType(requests);

    // Group requests by technician
    const byTechnician = await this.getRequestsByTechnician(requests);

    // Calculate resolution time by type
    const resolutionTime = await this.getResolutionTimeByType(requests);

    // Calculate average resolution time
    const averageResolutionTime = this.calculateAverageResolutionTime(requests);

    // Get monthly trend
    const trend = await this.getRequestMonthlyTrend();

    return {
      total,
      byStatus,
      byType,
      byTechnician,
      resolutionTime,
      averageResolutionTime,
      trend,
      generatedAt: new Date()
    };
  }

  /**
   * Export equipment report to Excel
   */
  async exportEquipmentReport(params: any) {
    const report = await this.generateEquipmentReport(params);

    // Create workbook structure for equipment report
    const worksheets = [
      {
        name: 'Summary',
        data: [
          ['Equipment Report', null],
          ['Generated at', report.generatedAt.toLocaleString()],
          ['Total equipment', report.total],
          [null, null],
          ['By Category', null],
          ['Category', 'Count', '% of Total'],
          ...report.byCategory.map(item => [
            item.category,
            item.count,
            `${((item.count / report.total) * 100).toFixed(2)}%`
          ]),
          [null, null],
          ['By Status', null],
          ['Status', 'Count', '% of Total'],
          ...report.byStatus.map(item => [
            item.status,
            item.count,
            `${((item.count / report.total) * 100).toFixed(2)}%`
          ]),
          [null, null],
          ['By Age', null],
          ['Age Group', 'Count', '% of Total'],
          ...report.byAge.map(item => [
            item.ageGroup,
            item.count,
            `${((item.count / report.total) * 100).toFixed(2)}%`
          ])
        ]
      }
    ];

    return this.excelService.generateExcel(worksheets);
  }

  /**
   * Export request report to Excel
   */
  async exportRequestReport(params: any) {
    const report = await this.generateRequestReport(params);

    // Create workbook structure for request report
    const worksheets = [
      {
        name: 'Summary',
        data: [
          ['Request Report', null],
          ['Generated at', report.generatedAt.toLocaleString()],
          ['Total requests', report.total],
          [null, null],
          ['By Status', null],
          ['Status', 'Count', '% of Total'],
          ...report.byStatus.map(item => [
            item.status,
            item.count,
            `${((item.count / report.total) * 100).toFixed(2)}%`
          ]),
          [null, null],
          ['By Type', null],
          ['Type', 'Count', '% of Total'],
          ...report.byType.map(item => [
            item.type,
            item.count,
            `${((item.count / report.total) * 100).toFixed(2)}%`
          ]),
          [null, null],
          ['By Technician', null],
          ['Technician', 'Completed', 'In Progress', 'Total'],
          ...report.byTechnician.map(item => [
            item.technician,
            item.completed,
            item.inProgress,
            item.total
          ]),
          [null, null],
          ['Resolution Time (hours)', null],
          ['Type', 'Average Hours'],
          ...report.resolutionTime.map(item => [
            item.type,
            item.hours
          ]),
          ['Average overall', report.averageResolutionTime]
        ]
      },
      {
        name: 'Monthly Trend',
        data: [
          ['Month', 'Count'],
          ...report.trend.map(item => [
            item.month,
            item.count
          ])
        ]
      }
    ];

    return this.excelService.generateExcel(worksheets);
  }

  /**
   * Group equipment by category
   */
  private async getEquipmentByCategory(equipment: Equipment[]) {
    // Get all categories (including those with no equipment)
    const categories = await this.categoryRepository.find();

    // Create a map for counting equipment by category
    const categoryMap = new Map<string, number>();
    categories.forEach(category => categoryMap.set(category.name, 0));

    // Count equipment by category
    equipment.forEach(item => {
      const categoryName = item.category?.name || 'Uncategorized';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
    });

    // Convert map to array of objects
    return Array.from(categoryMap.entries())
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Group equipment by status
   */
  private async getEquipmentByStatus(equipment: Equipment[]) {
    // Get all statuses (including those with no equipment)
    const statuses = await this.statusRepository.find();

    // Create a map for counting equipment by status
    const statusMap = new Map<string, number>();
    statuses.forEach(status => statusMap.set(status.name, 0));

    // Count equipment by status
    equipment.forEach(item => {
      const statusName = item.status?.name || 'Unknown';
      statusMap.set(statusName, (statusMap.get(statusName) || 0) + 1);
    });

    // Convert map to array of objects
    return Array.from(statusMap.entries())
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Group equipment by age
   */
  private getEquipmentByAge(equipment: Equipment[]) {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(now.getFullYear() - 3);

    const lessThanOneYear = equipment.filter(item => {
      return item.purchaseDate && new Date(item.purchaseDate) > oneYearAgo;
    }).length;

    const oneToThreeYears = equipment.filter(item => {
      return item.purchaseDate &&
        new Date(item.purchaseDate) <= oneYearAgo &&
        new Date(item.purchaseDate) > threeYearsAgo;
    }).length;

    const moreThanThreeYears = equipment.filter(item => {
      return item.purchaseDate && new Date(item.purchaseDate) <= threeYearsAgo;
    }).length;

    const noDate = equipment.filter(item => !item.purchaseDate).length;

    return [
      { ageGroup: 'Less than 1 year', count: lessThanOneYear },
      { ageGroup: '1-3 years', count: oneToThreeYears },
      { ageGroup: 'More than 3 years', count: moreThanThreeYears },
      { ageGroup: 'No purchase date', count: noDate }
    ].filter(item => item.count > 0);
  }

  /**
   * Group requests by status
   */
  private async getRequestsByStatus(requests: Request[]) {
    // Get all statuses (including those with no requests)
    const statuses = await this.requestStatusRepository.find();

    // Create a map for counting requests by status
    const statusMap = new Map<string, number>();
    statuses.forEach(status => statusMap.set(status.name, 0));

    // Count requests by status
    requests.forEach(item => {
      const statusName = item.status?.name || 'Unknown';
      statusMap.set(statusName, (statusMap.get(statusName) || 0) + 1);
    });

    // Convert map to array of objects
    return Array.from(statusMap.entries())
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Group requests by type
   */
  private async getRequestsByType(requests: Request[]) {
    // Get all types (including those with no requests)
    const types = await this.requestTypeRepository.find();

    // Create a map for counting requests by type
    const typeMap = new Map<string, number>();
    types.forEach(type => typeMap.set(type.name, 0));

    // Count requests by type
    requests.forEach(item => {
      const typeName = item.type?.name || 'Unknown';
      typeMap.set(typeName, (typeMap.get(typeName) || 0) + 1);
    });

    // Convert map to array of objects
    return Array.from(typeMap.entries())
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Group requests by technician
   */
  private async getRequestsByTechnician(requests: Request[]) {
    // Get technicians who have been assigned requests
    const technicianIds = [...new Set(requests
      .filter(req => req.assignedToId)
      .map(req => req.assignedToId))];

    const technicians = await this.userRepository.findBy({
      id: In(technicianIds),
    });

    // Create result structure
    const result = [];

    for (const technician of technicians) {
      const technicianRequests = requests.filter(req => req.assignedToId === technician.id);
      const completed = technicianRequests.filter(req => req.status?.name === 'Выполнена').length;
      const inProgress = technicianRequests.filter(req => req.status?.name !== 'Выполнена' && req.status?.name !== 'Отменена').length;

      result.push({
        technician: technician.name,
        completed,
        inProgress,
        total: technicianRequests.length
      });
    }

    return result.sort((a, b) => b.total - a.total);
  }

  /**
   * Calculate resolution time by request type
   */
  private async getResolutionTimeByType(requests: Request[]) {
    // Filter completed requests
    const completedRequests = requests.filter(req => req.completedAt);

    // Group by type
    const types = await this.requestTypeRepository.find();
    const result = [];

    for (const type of types) {
      const typeRequests = completedRequests.filter(req => req.typeId === type.id);

      if (typeRequests.length === 0) continue;

      // Calculate average resolution time in hours
      let totalHours = 0;

      for (const req of typeRequests) {
        const created = new Date(req.createdAt);
        const completed = new Date(req.completedAt);
        const hours = (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
        totalHours += hours;
      }

      const averageHours = totalHours / typeRequests.length;

      result.push({
        type: type.name,
        hours: parseFloat(averageHours.toFixed(2)),
        count: typeRequests.length
      });
    }

    return result.sort((a, b) => a.hours - b.hours);
  }

  /**
   * Calculate average resolution time for all requests
   */
  private calculateAverageResolutionTime(requests: Request[]) {
    // Filter completed requests
    const completedRequests = requests.filter(req => req.completedAt);

    if (completedRequests.length === 0) {
      return 0;
    }

    // Calculate total hours
    let totalHours = 0;

    for (const req of completedRequests) {
      const created = new Date(req.createdAt);
      const completed = new Date(req.completedAt);
      const hours = (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
      totalHours += hours;
    }

    return parseFloat((totalHours / completedRequests.length).toFixed(2));
  }

  /**
   * Get monthly trend of requests
   */
  private async getRequestMonthlyTrend() {
    // Get last 12 months
    const now = new Date();
    const months = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthStr = year + '-' + month.toString().padStart(2, '0');
      months.push({
        month: monthStr,
        start: new Date(year, month - 1, 1),
        end: new Date(year, month, 0)
      });
    }

    // Get counts for each month
    const result = [];

    for (const month of months) {
      const count = await this.requestRepository.count({
        where: {
          createdAt: Between(month.start, month.end)
        }
      });

      result.push({
        month: month.month,
        count
      });
    }

    return result;
  }
}