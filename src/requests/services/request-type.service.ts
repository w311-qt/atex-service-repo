import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestType } from '../entities/request-type.entity';
import { CreateRequestTypeDto } from '../dto/create-request-type.dto';
import { UpdateRequestTypeDto } from '../dto/update-request-type.dto';

@Injectable()
export class RequestTypeService {
  constructor(
    @InjectRepository(RequestType)
    private requestTypeRepository: Repository<RequestType>,
  ) {}

  async findAll(): Promise<RequestType[]> {
    return this.requestTypeRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<RequestType> {
    const requestType = await this.requestTypeRepository.findOne({
      where: { id },
    });

    if (!requestType) {
      throw new NotFoundException(`Request type with ID "${id}" not found`);
    }

    return requestType;
  }

  async create(createRequestTypeDto: CreateRequestTypeDto): Promise<RequestType> {
    // Check if type with this name already exists
    const existingType = await this.requestTypeRepository.findOne({
      where: { name: createRequestTypeDto.name },
    });

    if (existingType) {
      throw new ConflictException(`Request type with name "${createRequestTypeDto.name}" already exists`);
    }

    const requestType = this.requestTypeRepository.create(createRequestTypeDto);
    return this.requestTypeRepository.save(requestType);
  }

  async update(id: string, updateRequestTypeDto: UpdateRequestTypeDto): Promise<RequestType> {
    const requestType = await this.findOne(id);

    // Check if name is being updated and is already in use
    if (updateRequestTypeDto.name && updateRequestTypeDto.name !== requestType.name) {
      const existingType = await this.requestTypeRepository.findOne({
        where: { name: updateRequestTypeDto.name },
      });

      if (existingType) {
        throw new ConflictException(`Request type with name "${updateRequestTypeDto.name}" already exists`);
      }
    }

    Object.assign(requestType, updateRequestTypeDto);
    return this.requestTypeRepository.save(requestType);
  }

  async remove(id: string): Promise<void> {
    const requestType = await this.findOne(id);

    // Check if type is in use
    const requestCount = await this.requestTypeRepository
      .createQueryBuilder('requestType')
      .leftJoin('requestType.requests', 'request')
      .where('requestType.id = :id', { id })
      .select('COUNT(request.id)', 'count')
      .getRawOne();

    if (requestCount && parseInt(requestCount.count, 10) > 0) {
      throw new ConflictException(
        `Cannot delete request type. It is used by ${requestCount.count} request(s).`,
      );
    }

    await this.requestTypeRepository.remove(requestType);
  }
}
