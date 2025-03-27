import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from '../entities/status.entity';
import { CreateStatusDto } from '../dto/create-status.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
  ) {}

  async findAll(): Promise<Status[]> {
    return this.statusRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Status> {
    const status = await this.statusRepository.findOne({
      where: { id },
    });

    if (!status) {
      throw new NotFoundException(`Status with ID "${id}" not found`);
    }

    return status;
  }

  async create(createStatusDto: CreateStatusDto): Promise<Status> {
    // Check if status with this name already exists
    const existingStatus = await this.statusRepository.findOne({
      where: { name: createStatusDto.name },
    });

    if (existingStatus) {
      throw new ConflictException(`Status with name "${createStatusDto.name}" already exists`);
    }

    const status = this.statusRepository.create(createStatusDto);
    return this.statusRepository.save(status);
  }

  async update(id: string, updateStatusDto: UpdateStatusDto): Promise<Status> {
    const status = await this.findOne(id);

    // Check if name is being updated and is already in use
    if (updateStatusDto.name && updateStatusDto.name !== status.name) {
      const existingStatus = await this.statusRepository.findOne({
        where: { name: updateStatusDto.name },
      });

      if (existingStatus) {
        throw new ConflictException(`Status with name "${updateStatusDto.name}" already exists`);
      }
    }

    Object.assign(status, updateStatusDto);
    return this.statusRepository.save(status);
  }

  async remove(id: string): Promise<void> {
    const status = await this.findOne(id);

    // Check if status is in use
    const equipmentCount = await this.statusRepository
      .createQueryBuilder('status')
      .leftJoin('status.equipment', 'equipment')
      .where('status.id = :id', { id })
      .select('COUNT(equipment.id)', 'count')
      .getRawOne();

    if (equipmentCount && equipmentCount.count > 0) {
      throw new ConflictException(
        `Cannot delete status. It is used by ${equipmentCount.count} equipment item(s).`,
      );
    }

    await this.statusRepository.remove(status);
  }
}
