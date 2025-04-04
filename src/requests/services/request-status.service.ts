import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestStatus } from '../entities/request-status.entity';
import { CreateRequestStatusDto } from '../dto/create-request-status.dto';
import { UpdateRequestStatusDto } from '../dto/update-request-status.dto';

@Injectable()
export class RequestStatusService {
  constructor(
    @InjectRepository(RequestStatus)
    private requestStatusRepository: Repository<RequestStatus>,
  ) {}

  async findAll(): Promise<RequestStatus[]> {
    return this.requestStatusRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<RequestStatus> {
    const requestStatus = await this.requestStatusRepository.findOne({
      where: { id },
    });

    if (!requestStatus) {
      throw new NotFoundException(`Request status with ID "${id}" not found`);
    }

    return requestStatus;
  }

  async create(createRequestStatusDto: CreateRequestStatusDto): Promise<RequestStatus> {
    // Check if status with this name already exists
    const existingStatus = await this.requestStatusRepository.findOne({
      where: { name: createRequestStatusDto.name },
    });

    if (existingStatus) {
      throw new ConflictException(
        `Request status with name "${createRequestStatusDto.name}" already exists`,
      );
    }

    const requestStatus = this.requestStatusRepository.create(createRequestStatusDto);
    return this.requestStatusRepository.save(requestStatus);
  }

  async update(id: string, updateRequestStatusDto: UpdateRequestStatusDto): Promise<RequestStatus> {
    const requestStatus = await this.findOne(id);

    // Check if name is being updated and is already in use
    if (updateRequestStatusDto.name && updateRequestStatusDto.name !== requestStatus.name) {
      const existingStatus = await this.requestStatusRepository.findOne({
        where: { name: updateRequestStatusDto.name },
      });

      if (existingStatus) {
        throw new ConflictException(
          `Request status with name "${updateRequestStatusDto.name}" already exists`,
        );
      }
    }

    Object.assign(requestStatus, updateRequestStatusDto);
    return this.requestStatusRepository.save(requestStatus);
  }

  async remove(id: string): Promise<void> {
    const requestStatus = await this.findOne(id);

    // Check if status is in use
    const requestCount = await this.requestStatusRepository
      .createQueryBuilder('requestStatus')
      .leftJoin('requestStatus.requests', 'request')
      .where('requestStatus.id = :id', { id })
      .select('COUNT(request.id)', 'count')
      .getRawOne();

    if (requestCount && parseInt(requestCount.count, 10) > 0) {
      throw new ConflictException(
        `Cannot delete request status. It is used by ${requestCount.count} request(s).`,
      );
    }

    await this.requestStatusRepository.remove(requestStatus);
  }
}
