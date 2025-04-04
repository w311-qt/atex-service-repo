import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentSpecification } from '../entities/equipment-specification.entity';
import { CreateSpecificationDto, UpdateSpecificationDto } from '../dto/specification.dto';
import { EquipmentService } from './equipment.service';

@Injectable()
export class SpecificationService {
  constructor(
    @InjectRepository(EquipmentSpecification)
    private specificationRepository: Repository<EquipmentSpecification>,
    private equipmentService: EquipmentService,
  ) {}

  async findAllForEquipment(equipmentId: string): Promise<EquipmentSpecification[]> {
    // Check if equipment exists
    await this.equipmentService.findOne(equipmentId);

    return this.specificationRepository.find({
      where: { equipmentId },
      order: { key: 'ASC' },
    });
  }

  async findOne(id: string): Promise<EquipmentSpecification> {
    const specification = await this.specificationRepository.findOne({
      where: { id },
      relations: ['equipment'],
    });

    if (!specification) {
      throw new NotFoundException(`Specification with ID "${id}" not found`);
    }

    return specification;
  }

  async create(
    equipmentId: string,
    createSpecificationDto: CreateSpecificationDto,
  ): Promise<EquipmentSpecification> {
    // Check if equipment exists
    await this.equipmentService.findOne(equipmentId);

    const specification = this.specificationRepository.create({
      ...createSpecificationDto,
      equipmentId,
    });

    return this.specificationRepository.save(specification);
  }

  async update(
    id: string,
    updateSpecificationDto: UpdateSpecificationDto,
  ): Promise<EquipmentSpecification> {
    const specification = await this.findOne(id);

    Object.assign(specification, updateSpecificationDto);

    return this.specificationRepository.save(specification);
  }

  async remove(id: string): Promise<void> {
    const specification = await this.findOne(id);
    await this.specificationRepository.remove(specification);
  }

  // Add bulk operations for specifications
  async createMany(
    equipmentId: string,
    specifications: CreateSpecificationDto[],
  ): Promise<EquipmentSpecification[]> {
    // Check if equipment exists
    await this.equipmentService.findOne(equipmentId);

    const specEntities = specifications.map((spec) =>
      this.specificationRepository.create({
        ...spec,
        equipmentId,
      }),
    );

    return this.specificationRepository.save(specEntities);
  }

  async removeAllForEquipment(equipmentId: string): Promise<void> {
    // Check if equipment exists
    await this.equipmentService.findOne(equipmentId);

    await this.specificationRepository.delete({ equipmentId });
  }
}
