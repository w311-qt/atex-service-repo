// src/equipment/services/equipment.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Equipment } from '../entities/equipment.entity';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';
import { EquipmentFilterDto } from '../dto/equipment-filter.dto';
import { EquipmentResponseDto } from '../dto/equipment-response.dto';
import { AssignEquipmentDto } from '../dto/assign-equipment.dto';
import { UsersService } from '../../users/users.service';
import { Logger } from '@nestjs/common';
import { FileService } from '../../file/file.service';
import { BulkAssignEquipmentDto, BulkStatusUpdateDto } from '../dto/bulk-operations.dto';

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);

  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    private usersService: UsersService,
    private fileService: FileService,
  ) {}

  async findAll(
    filterDto: EquipmentFilterDto,
  ): Promise<{ data: EquipmentResponseDto[]; total: number; page: number; limit: number }> {
    const { search, categoryId, statusId, assignedToId, location } = filterDto;

    // Ensure page and limit have default values
    const page = filterDto.page ?? 1;
    const limit = filterDto.limit ?? 10;
    const sortBy = filterDto.sortBy ?? 'name';
    const order = filterDto.order ?? 'ASC';

    // Build query
    const queryBuilder = this.equipmentRepository.createQueryBuilder('equipment');

    // Add conditions
    if (categoryId) {
      queryBuilder.andWhere('equipment.categoryId = :categoryId', { categoryId });
    }

    if (statusId) {
      queryBuilder.andWhere('equipment.statusId = :statusId', { statusId });
    }

    if (filterDto.categoryIds && filterDto.categoryIds.length > 0) {
      queryBuilder.andWhere('equipment.categoryId IN (:...categoryIds)', {
        categoryIds: filterDto.categoryIds,
      });
    }

    // Добавить фильтрацию по массиву статусов
    if (filterDto.statusIds && filterDto.statusIds.length > 0) {
      queryBuilder.andWhere('equipment.statusId IN (:...statusIds)', {
        statusIds: filterDto.statusIds,
      });
    }

    // Добавить фильтрацию по диапазону дат
    if (filterDto.purchaseDateFrom) {
      queryBuilder.andWhere('equipment.purchaseDate >= :purchaseDateFrom', {
        purchaseDateFrom: filterDto.purchaseDateFrom,
      });
    }

    if (filterDto.purchaseDateTo) {
      queryBuilder.andWhere('equipment.purchaseDate <= :purchaseDateTo', {
        purchaseDateTo: filterDto.purchaseDateTo,
      });
    }

    if (assignedToId) {
      queryBuilder.andWhere('equipment.assignedToId = :assignedToId', { assignedToId });
    }

    if (location) {
      queryBuilder.andWhere('equipment.location ILIKE :location', { location: `%${location}%` });
    }

    // Add search functionality
    if (search) {
      queryBuilder.andWhere(
        '(equipment.name ILIKE :search OR equipment.model ILIKE :search OR equipment.inventoryNumber ILIKE :search OR equipment.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Add relations
    queryBuilder.leftJoinAndSelect('equipment.category', 'category');
    queryBuilder.leftJoinAndSelect('equipment.status', 'status');
    queryBuilder.leftJoinAndSelect('equipment.assignedTo', 'assignedTo');

    // Add sorting
    queryBuilder.orderBy(`equipment.${sortBy}`, order);

    // Add pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [equipment, total] = await queryBuilder.getManyAndCount();

    return {
      data: equipment.map((item) =>
        plainToInstance(EquipmentResponseDto, item, { excludeExtraneousValues: true }),
      ),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<EquipmentResponseDto> {
    const equipment = await this.equipmentRepository.findOne({
      where: { id },
      relations: ['category', 'status', 'assignedTo'],
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID "${id}" not found`);
    }

    return plainToInstance(EquipmentResponseDto, equipment, { excludeExtraneousValues: true });
  }

  async create(createEquipmentDto: CreateEquipmentDto): Promise<EquipmentResponseDto> {
    // Check if inventory number is already in use
    const existingEquipment = await this.equipmentRepository.findOne({
      where: { inventoryNumber: createEquipmentDto.inventoryNumber },
    });

    if (existingEquipment) {
      throw new ConflictException(
        `Equipment with inventory number "${createEquipmentDto.inventoryNumber}" already exists`,
      );
    }

    // Create new equipment
    const equipment = this.equipmentRepository.create(createEquipmentDto);
    const savedEquipment = await this.equipmentRepository.save(equipment);

    // Log the creation
    this.logger.log(`Equipment created: ${savedEquipment.id} - ${savedEquipment.name}`);

    return this.findOne(savedEquipment.id);
  }

  async update(id: string, updateEquipmentDto: UpdateEquipmentDto): Promise<EquipmentResponseDto> {
    const equipment = await this.findOneEntity(id);

    // Check if inventory number is being updated and is already in use
    if (
      updateEquipmentDto.inventoryNumber &&
      updateEquipmentDto.inventoryNumber !== equipment.inventoryNumber
    ) {
      const existingEquipment = await this.equipmentRepository.findOne({
        where: { inventoryNumber: updateEquipmentDto.inventoryNumber },
      });

      if (existingEquipment) {
        throw new ConflictException(
          `Equipment with inventory number "${updateEquipmentDto.inventoryNumber}" already exists`,
        );
      }
    }

    // Apply updates
    Object.assign(equipment, updateEquipmentDto);
    const updatedEquipment = await this.equipmentRepository.save(equipment);

    // Log the update
    this.logger.log(`Equipment updated: ${updatedEquipment.id} - ${updatedEquipment.name}`);

    return this.findOne(updatedEquipment.id);
  }

  async assignToUser(id: string, assignDto: AssignEquipmentDto): Promise<EquipmentResponseDto> {
    const equipment = await this.findOneEntity(id);

    // Check if user exists
    if (assignDto.userId) {
      await this.usersService.findOne(assignDto.userId);
    }

    // Update assignment
    equipment.assignedToId = assignDto.userId;
    const updatedEquipment = await this.equipmentRepository.save(equipment);

    // Log the assignment
    this.logger.log(`Equipment ${id} assigned to user ${assignDto.userId}`);

    return this.findOne(updatedEquipment.id);
  }

  // Helper method to find equipment entity with error handling
  private async findOneEntity(id: string): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOne({
      where: { id },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID "${id}" not found`);
    }

    return equipment;
  }
  async uploadImage(id: string, filename: string): Promise<EquipmentResponseDto> {
    const equipment = await this.findOneEntity(id);

    if (equipment.image) {
      try {
        await this.fileService.deleteFile(equipment.image);
      } catch (error) {
        this.logger.warn(`Failed to delete previous image ${equipment.image}: ${error.message}`);
      }
    }

    equipment.image = filename;
    const updatedEquipment = await this.equipmentRepository.save(equipment);

    this.logger.log(`Updated image for equipment ${id}: ${filename}`);

    return this.findOne(updatedEquipment.id);
  }

  async remove(id: string): Promise<void> {
    const equipment = await this.findOneEntity(id);

    // Удаляем изображение, если оно есть
    if (equipment.image) {
      try {
        await this.fileService.deleteFile(equipment.image);
        this.logger.log(`Deleted image ${equipment.image} for equipment ${id}`);
      } catch (error) {
        this.logger.warn(`Failed to delete image ${equipment.image}: ${error.message}`);
      }
    }

    await this.equipmentRepository.remove(equipment);
    this.logger.log(`Equipment deleted: ${id} - ${equipment.name}`);
  }
  async bulkAssignToUser(bulkAssignDto: BulkAssignEquipmentDto): Promise<void> {
    // Проверка существования пользователя
    await this.usersService.findOne(bulkAssignDto.userId);

    // Обновление assignedToId для всех указанных единиц оборудования
    await this.equipmentRepository.update(
      { id: In(bulkAssignDto.equipmentIds) },
      { assignedToId: bulkAssignDto.userId },
    );

    this.logger.log(
      `Assigned equipment ids ${bulkAssignDto.equipmentIds.join(', ')} to user ${bulkAssignDto.userId}`,
    );
  }

  async bulkUpdateStatus(bulkStatusDto: BulkStatusUpdateDto): Promise<void> {
    // Проверка существования статуса
    // Здесь должен быть вызов statusService.findOne()

    // Обновление statusId для всех указанных единиц оборудования
    await this.equipmentRepository.update(
      { id: In(bulkStatusDto.equipmentIds) },
      { statusId: bulkStatusDto.statusId },
    );

    this.logger.log(
      `Updated status to ${bulkStatusDto.statusId} for equipment ids ${bulkStatusDto.equipmentIds.join(', ')}`,
    );
  }
  async getStatistics(): Promise<any> {
    // Статистика по статусам
    const statusStats = await this.equipmentRepository
      .createQueryBuilder('equipment')
      .select('status.name', 'status')
      .addSelect('COUNT(equipment.id)', 'count')
      .leftJoin('equipment.status', 'status')
      .groupBy('status.name')
      .getRawMany();

    // Статистика по категориям
    const categoryStats = await this.equipmentRepository
      .createQueryBuilder('equipment')
      .select('category.name', 'category')
      .addSelect('COUNT(equipment.id)', 'count')
      .leftJoin('equipment.category', 'category')
      .groupBy('category.name')
      .getRawMany();

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
        WHEN equipment.purchaseDate > :oneYearAgo THEN 'Less than 1 year'
        WHEN equipment.purchaseDate > :threeYearsAgo THEN '1-3 years'
        ELSE 'More than 3 years'
      END`,
        'ageGroup',
      )
      .addSelect('COUNT(equipment.id)', 'count')
      .setParameter('oneYearAgo', oneYearAgo)
      .setParameter('threeYearsAgo', threeYearsAgo)
      .groupBy('ageGroup')
      .getRawMany();

    return {
      byStatus: statusStats,
      byCategory: categoryStats,
      byAge: ageStats,
      total: await this.equipmentRepository.count(),
    };
  }
}
