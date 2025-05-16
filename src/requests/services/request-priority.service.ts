import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestPriority } from '../entities/request-priority.entity';
import { CreateRequestPriorityDto } from '../dto/create-request-priority.dto';
import { UpdateRequestPriorityDto } from '../dto/update-request-priority.dto';

@Injectable()
export class RequestPriorityService {
  constructor(
    @InjectRepository(RequestPriority)
    private requestPriorityRepository: Repository<RequestPriority>,
  ) {}

  async findAll(): Promise<RequestPriority[]> {
    return this.requestPriorityRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<RequestPriority> {
    const requestPriority = await this.requestPriorityRepository.findOne({
      where: { id },
    });

    if (!requestPriority) {
      throw new NotFoundException(`Request priority with ID "${id}" not found`);
    }

    return requestPriority;
  }

  async create(createRequestPriorityDto: CreateRequestPriorityDto): Promise<RequestPriority> {
    const existingPriority = await this.requestPriorityRepository.findOne({
      where: { name: createRequestPriorityDto.name },
    });

    if (existingPriority) {
      throw new ConflictException(
        `Request priority with name "${createRequestPriorityDto.name}" already exists`,
      );
    }

    const requestPriority = this.requestPriorityRepository.create(createRequestPriorityDto);
    return this.requestPriorityRepository.save(requestPriority);
  }

  async update(
    id: string,
    updateRequestPriorityDto: UpdateRequestPriorityDto,
  ): Promise<RequestPriority> {
    const requestPriority = await this.findOne(id);

    if (updateRequestPriorityDto.name && updateRequestPriorityDto.name !== requestPriority.name) {
      const existingPriority = await this.requestPriorityRepository.findOne({
        where: { name: updateRequestPriorityDto.name },
      });

      if (existingPriority) {
        throw new ConflictException(
          `Request priority with name "${updateRequestPriorityDto.name}" already exists`,
        );
      }
    }

    Object.assign(requestPriority, updateRequestPriorityDto);
    return this.requestPriorityRepository.save(requestPriority);
  }

  async remove(id: string): Promise<void> {
    const requestPriority = await this.findOne(id);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const requestCount = await this.requestPriorityRepository
      .createQueryBuilder('requestPriority')
      .leftJoin('requestPriority.requests', 'request')
      .where('requestPriority.id = :id', { id })
      .select('COUNT(request.id)', 'count')
      .getRawOne();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
    if (requestCount && parseInt(requestCount.count, 10) > 0) {
      throw new ConflictException(
        `Cannot delete request priority. It is used by ${requestCount.count} request(s).`,
      );
    }

    await this.requestPriorityRepository.remove(requestPriority);
  }
}
