import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Equipment } from '../equipment/entities/equipment.entity';
import { Request } from '../requests/entities/request.entity';
import { EquipmentAnalyticsFilterDto } from './dto/equipment-analytics-filter.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
  ) {
  }

  /**
   * Получает общую сводку по оборудованию
   */
  async getEquipmentSummary(): Promise<any> {
    try {
      // Общее количество оборудования
      const totalEquipment = await this.equipmentRepository.count();

      // Распределение по статусам
      const statusDistribution = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('status.name', 'status')
        .addSelect('COUNT(equipment.id)', 'count')
        .leftJoin('equipment.status', 'status')
        .groupBy('status.name')
        .getRawMany();

      // Распределение по категориям
      const categoryDistribution = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('category.name', 'category')
        .addSelect('COUNT(equipment.id)', 'count')
        .leftJoin('equipment.category', 'category')
        .groupBy('category.name')
        .getRawMany();

      // Недавно добавленное оборудование
      const recentlyAdded = await this.equipmentRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
        relations: ['category', 'status'],
      });

      // Статистика по возрасту оборудования
      const currentDate = new Date();
      const oneYearAgo = new Date(currentDate);
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

      const threeYearsAgo = new Date(currentDate);
      threeYearsAgo.setFullYear(currentDate.getFullYear() - 3);

      const fiveYearsAgo = new Date(currentDate);
      fiveYearsAgo.setFullYear(currentDate.getFullYear() - 5);

      const ageDistribution = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select(
          `CASE
            WHEN equipment.purchaseDate > :oneYearAgo THEN 'До 1 года'
            WHEN equipment.purchaseDate > :threeYearsAgo THEN '1-3 года'
            WHEN equipment.purchaseDate > :fiveYearsAgo THEN '3-5 лет'
            ELSE 'Более 5 лет'
          END`,
          'ageGroup',
        )
        .addSelect('COUNT(equipment.id)', 'count')
        .setParameter('oneYearAgo', oneYearAgo)
        .setParameter('threeYearsAgo', threeYearsAgo)
        .setParameter('fiveYearsAgo', fiveYearsAgo)
        .groupBy('ageGroup')
        .getRawMany();

      // Статистика по местоположению
      const locationDistribution = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('COALESCE(equipment.location, \'Не указано\')', 'location')
        .addSelect('COUNT(equipment.id)', 'count')
        .groupBy('location')
        .getRawMany();

      return {
        totalEquipment,
        statusDistribution,
        categoryDistribution,
        ageDistribution,
        locationDistribution,
        recentlyAdded,
      };
    } catch (error) {
      this.logger.error(`Error in getEquipmentSummary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получает статистику по оборудованию в разрезе категорий
   */
  async getEquipmentByCategory(): Promise<any> {
    try {
      // Количество оборудования по категориям
      const categoryStats = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('category.name', 'category')
        .addSelect('COUNT(equipment.id)', 'count')
        .leftJoin('equipment.category', 'category')
        .groupBy('category.name')
        .orderBy('count', 'DESC')
        .getRawMany();

      // Статусы в разрезе категорий
      const categoryStatusStats = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('category.name', 'category')
        .addSelect('status.name', 'status')
        .addSelect('COUNT(equipment.id)', 'count')
        .leftJoin('equipment.category', 'category')
        .leftJoin('equipment.status', 'status')
        .groupBy('category.name')
        .addGroupBy('status.name')
        .orderBy('category.name', 'ASC')
        .addOrderBy('count', 'DESC')
        .getRawMany();

      // Топ-5 категорий по стоимости оборудования (заглушка - добавить логику расчета стоимости)
      const topCategories = categoryStats.slice(0, 5);

      return {
        categoryStats,
        categoryStatusStats,
        topCategories,
      };
    } catch (error) {
      this.logger.error(`Error in getEquipmentByCategory: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получает статистику по оборудованию в разрезе статусов
   */
  async getEquipmentByStatus(): Promise<any> {
    try {
      // Распределение оборудования по статусам
      const statusStats = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('status.name', 'status')
        .addSelect('status.color', 'color')
        .addSelect('COUNT(equipment.id)', 'count')
        .leftJoin('equipment.status', 'status')
        .groupBy('status.name')
        .addGroupBy('status.color')
        .orderBy('count', 'DESC')
        .getRawMany();

      // Категории в разрезе статусов
      const statusCategoryStats = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('status.name', 'status')
        .addSelect('category.name', 'category')
        .addSelect('COUNT(equipment.id)', 'count')
        .leftJoin('equipment.status', 'status')
        .leftJoin('equipment.category', 'category')
        .groupBy('status.name')
        .addGroupBy('category.name')
        .orderBy('status.name', 'ASC')
        .addOrderBy('count', 'DESC')
        .getRawMany();

      // Тренд изменения статусов по месяцам (заглушка - в реальности нужна таблица истории изменений)
      const statusTrend = [
        { month: 'Январь 2023', new: 15, working: 120, defective: 8, nonworking: 3 },
        { month: 'Февраль 2023', new: 10, working: 125, defective: 10, nonworking: 4 },
        { month: 'Март 2023', new: 12, working: 130, defective: 7, nonworking: 5 },
      ];

      return {
        statusStats,
        statusCategoryStats,
        statusTrend,
      };
    } catch (error) {
      this.logger.error(`Error in getEquipmentByStatus: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получает статистику по оборудованию в разрезе возраста
   */
  async getEquipmentByAge(): Promise<any> {
    try {
      const currentDate = new Date();

      // Возрастные группы оборудования
      const oneYearAgo = new Date(currentDate);
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

      const threeYearsAgo = new Date(currentDate);
      threeYearsAgo.setFullYear(currentDate.getFullYear() - 3);

      const fiveYearsAgo = new Date(currentDate);
      fiveYearsAgo.setFullYear(currentDate.getFullYear() - 5);

      const ageStats = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select(
          `CASE
            WHEN equipment.purchaseDate > :oneYearAgo THEN 'До 1 года'
            WHEN equipment.purchaseDate > :threeYearsAgo THEN '1-3 года'
            WHEN equipment.purchaseDate > :fiveYearsAgo THEN '3-5 лет'
            ELSE 'Более 5 лет'
          END`,
          'ageGroup',
        )
        .addSelect('COUNT(equipment.id)', 'count')
        .setParameter('oneYearAgo', oneYearAgo)
        .setParameter('threeYearsAgo', threeYearsAgo)
        .setParameter('fiveYearsAgo', fiveYearsAgo)
        .groupBy('ageGroup')
        .orderBy(
          `CASE
            WHEN "ageGroup" = 'До 1 года' THEN 1
            WHEN "ageGroup" = '1-3 года' THEN 2
            WHEN "ageGroup" = '3-5 лет' THEN 3
            WHEN "ageGroup" = 'Более 5 лет' THEN 4
            ELSE 5
          END`,
          'ASC',
        )
        .getRawMany();

      // Возраст оборудования по категориям (средний возраст в месяцах)
      const ageByCategory = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('category.name', 'category')
        .addSelect('AVG(EXTRACT(EPOCH FROM (NOW() - equipment.purchaseDate)) / (60*60*24*30))', 'averageAgeMonths')
        .leftJoin('equipment.category', 'category')
        .where('equipment.purchaseDate IS NOT NULL')
        .groupBy('category.name')
        .orderBy('averageAgeMonths', 'DESC')
        .getRawMany();

      // Статусы оборудования в разрезе возрастных групп
      const statusByAge = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select(
          `CASE
            WHEN equipment.purchaseDate > :oneYearAgo THEN 'До 1 года'
            WHEN equipment.purchaseDate > :threeYearsAgo THEN '1-3 года'
            WHEN equipment.purchaseDate > :fiveYearsAgo THEN '3-5 лет'
            ELSE 'Более 5 лет'
          END`,
          'ageGroup',
        )
        .addSelect('status.name', 'status')
        .addSelect('COUNT(equipment.id)', 'count')
        .leftJoin('equipment.status', 'status')
        .setParameter('oneYearAgo', oneYearAgo)
        .setParameter('threeYearsAgo', threeYearsAgo)
        .setParameter('fiveYearsAgo', fiveYearsAgo)
        .where('equipment.purchaseDate IS NOT NULL')
        .groupBy('ageGroup')
        .addGroupBy('status.name')
        .orderBy('ageGroup', 'ASC')
        .addOrderBy('count', 'DESC')
        .getRawMany();

      return {
        ageStats,
        ageByCategory,
        statusByAge,
      };
    } catch (error) {
      this.logger.error(`Error in getEquipmentByAge: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получает статистику по оборудованию в разрезе местоположения
   */
  async getEquipmentByLocation(): Promise<any> {
    try {
      // Распределение оборудования по местоположениям
      const locationStats = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('COALESCE(equipment.location, \'Не указано\')', 'location')
        .addSelect('COUNT(equipment.id)', 'count')
        .groupBy('location')
        .orderBy('count', 'DESC')
        .getRawMany();

      // Категории оборудования по местоположениям
      const categoryByLocation = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('COALESCE(equipment.location, \'Не указано\')', 'location')
        .addSelect('category.name', 'category')
        .addSelect('COUNT(equipment.id)', 'count')
        .leftJoin('equipment.category', 'category')
        .groupBy('location')
        .addGroupBy('category.name')
        .orderBy('location', 'ASC')
        .addOrderBy('count', 'DESC')
        .getRawMany();

      // Статусы оборудования по местоположениям
      const statusByLocation = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('COALESCE(equipment.location, \'Не указано\')', 'location')
        .addSelect('status.name', 'status')
        .addSelect('COUNT(equipment.id)', 'count')
        .leftJoin('equipment.status', 'status')
        .groupBy('location')
        .addGroupBy('status.name')
        .orderBy('location', 'ASC')
        .addOrderBy('count', 'DESC')
        .getRawMany();

      return {
        locationStats,
        categoryByLocation,
        statusByLocation,
      };
    } catch (error) {
      this.logger.error(`Error in getEquipmentByLocation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получает статистику по оборудованию в разрезе пользователей
   */
  async getEquipmentByUser(): Promise<any> {
    try {
      // Распределение оборудования по пользователям
      const userStats = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('user.name', 'userName')
        .addSelect('user.department', 'department')
        .addSelect('COUNT(equipment.id)', 'count')
        .leftJoin('equipment.assignedTo', 'user')
        .where('equipment.assignedToId IS NOT NULL')
        .groupBy('user.name')
        .addGroupBy('user.department')
        .orderBy('count', 'DESC')
        .getRawMany();

      // Категории оборудования по пользователям
      const categoryByUser = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('user.name', 'userName')
        .addSelect('category.name', 'category')
        .addSelect('COUNT(equipment.id)', 'count')
        .leftJoin('equipment.assignedTo', 'user')
        .leftJoin('equipment.category', 'category')
        .where('equipment.assignedToId IS NOT NULL')
        .groupBy('user.name')
        .addGroupBy('category.name')
        .orderBy('userName', 'ASC')
        .addOrderBy('count', 'DESC')
        .getRawMany();

      // Статистика оборудования по отделам
      const departmentStats = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('user.department', 'department')
        .addSelect('COUNT(equipment.id)', 'count')
        .leftJoin('equipment.assignedTo', 'user')
        .where('equipment.assignedToId IS NOT NULL')
        .andWhere('user.department IS NOT NULL')
        .groupBy('user.department')
        .orderBy('count', 'DESC')
        .getRawMany();

      return {
        userStats,
        categoryByUser,
        departmentStats,
      };
    } catch (error) {
      this.logger.error(`Error in getEquipmentByUser: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получает данные для дашборда оборудования
   */
  async getEquipmentDashboard(): Promise<any> {
    try {
      // Общая сводка
      const totalEquipment = await this.equipmentRepository.count();
      const assignedEquipment = await this.equipmentRepository.count({
        where: { assignedToId: Not(IsNull()) },
      });
      const unassignedEquipment = totalEquipment - assignedEquipment;

      // Получаем статусы
      const statusStats = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('status.name', 'status')
        .addSelect('status.color', 'color')
        .addSelect('COUNT(equipment.id)', 'count')
        .leftJoin('equipment.status', 'status')
        .groupBy('status.name')
        .addGroupBy('status.color')
        .getRawMany();

      // Получаем категории
      const categoryStats = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select('category.name', 'category')
        .addSelect('COUNT(equipment.id)', 'count')
        .leftJoin('equipment.category', 'category')
        .groupBy('category.name')
        .getRawMany();

      // Недавно добавленное оборудование
      const recentEquipment = await this.equipmentRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
        relations: ['category', 'status', 'assignedTo'],
      });

      // Недавние заявки по оборудованию
      const recentRequests = await this.requestRepository.find({
        where: { equipmentId: Not(IsNull()) },
        order: { createdAt: 'DESC' },
        take: 5,
        relations: ['equipment', 'status', 'type', 'priority', 'createdBy'],
      });

      // Статистика по возрасту оборудования
      const currentDate = new Date();
      const oneYearAgo = new Date(currentDate);
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

      const threeYearsAgo = new Date(currentDate);
      threeYearsAgo.setFullYear(currentDate.getFullYear() - 3);

      const ageStats = await this.equipmentRepository
        .createQueryBuilder('equipment')
        .select(
          `CASE
            WHEN equipment.purchaseDate > :oneYearAgo THEN 'До 1 года'
            WHEN equipment.purchaseDate > :threeYearsAgo THEN '1-3 года'
            ELSE 'Более 3 лет'
          END`,
          'ageGroup',
        )
        .addSelect('COUNT(equipment.id)', 'count')
        .setParameter('oneYearAgo', oneYearAgo)
        .setParameter('threeYearsAgo', threeYearsAgo)
        .groupBy('ageGroup')
        .getRawMany();

      return {
        summary: {
          total: totalEquipment,
          assigned: assignedEquipment,
          unassigned: unassignedEquipment,
        },
        statusStats,
        categoryStats,
        ageStats,
        recentEquipment,
        recentRequests,
      };
    } catch (error) {
      this.logger.error(`Error in getEquipmentDashboard: ${error.message}`);
      throw error;
    }
  }
}
