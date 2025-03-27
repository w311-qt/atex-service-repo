// src/equipment/services/equipment.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Equipment } from '../entities/equipment.entity';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';
import { EquipmentFilterDto } from '../dto/equipment-filter.dto';
import { EquipmentResponseDto } from '../dto/equipment-response.dto';
import { AssignEquipmentDto } from '../dto/assign-equipment.dto';
import { UsersService } from '../../users/users.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);

  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    private usersService: UsersService,
  ) {}

  async findAll(filterDto: EquipmentFilterDto): Promise<{ data: EquipmentResponseDto[]; total: number; page: number; limit: number }> {
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
      data: equipment.map(item => plainToInstance(EquipmentResponseDto, item, { excludeExtraneousValues: true })),
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
      throw new ConflictException(`Equipment with inventory number "${createEquipmentDto.inventoryNumber}" already exists`);
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
    if (updateEquipmentDto.inventoryNumber && updateEquipmentDto.inventoryNumber !== equipment.inventoryNumber) {
      const existingEquipment = await this.equipmentRepository.findOne({
        where: { inventoryNumber: updateEquipmentDto.inventoryNumber },
      });

      if (existingEquipment) {
        throw new ConflictException(`Equipment with inventory number "${updateEquipmentDto.inventoryNumber}" already exists`);
      }
    }

    // Apply updates
    Object.assign(equipment, updateEquipmentDto);
    const updatedEquipment = await this.equipmentRepository.save(equipment);

    // Log the update
    this.logger.log(`Equipment updated: ${updatedEquipment.id} - ${updatedEquipment.name}`);

    return this.findOne(updatedEquipment.id);
  }

  async remove(id: string): Promise<void> {
    const equipment = await this.findOneEntity(id);
    await this.equipmentRepository.remove(equipment);

    // Log the deletion
    this.logger.log(`Equipment deleted: ${id} - ${equipment.name}`);
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
}
