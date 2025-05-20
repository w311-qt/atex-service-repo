import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Equipment } from '../../equipment/entities/equipment.entity';
import { Category } from '../../equipment/entities/category.entity';
import { Status } from '../../equipment/entities/status.entity';
import { User } from '../../users/entities/user.entity';
import { Request } from '../../requests/entities/request.entity';
import { RequestStatus } from '../../requests/entities/request-status.entity';
import { RequestType } from '../../requests/entities/request-type.entity';
import { RequestPriority } from '../../requests/entities/request-priority.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(RequestStatus)
    private requestStatusRepository: Repository<RequestStatus>,
    @InjectRepository(RequestType)
    private requestTypeRepository: Repository<RequestType>,
    @InjectRepository(RequestPriority)
    private requestPriorityRepository: Repository<RequestPriority>,
  ) {}

  async generateEquipmentReport(params: any): Promise<Buffer> {
    const {
      categoryIds,
      statusIds,
      dateFrom,
      dateTo,
    } = params;

    const query: any = {
      relations: ['category', 'status', 'assignedTo'],
      order: { name: 'ASC' },
    };

    if (categoryIds && categoryIds.length > 0) {
      query.where = { ...query.where, categoryId: In(categoryIds) };
    }

    if (statusIds && statusIds.length > 0) {
      query.where = { ...query.where, statusId: In(statusIds) };
    }

    if (dateFrom || dateTo) {
      query.where = {
        ...query.where,
        purchaseDate: Between(
          dateFrom ? new Date(dateFrom) : new Date('1900-01-01'),
          dateTo ? new Date(dateTo) : new Date()
        )
      };
    }

    const equipment = await this.equipmentRepository.find(query);

    // Create Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Оборудование');

    // Define columns
    worksheet.columns = [
      { header: 'Наименование', key: 'name', width: 30 },
      { header: 'Инв. номер', key: 'inventoryNumber', width: 15 },
      { header: 'Модель', key: 'model', width: 20 },
      { header: 'Категория', key: 'category', width: 20 },
      { header: 'Статус', key: 'status', width: 15 },
      { header: 'Местоположение', key: 'location', width: 25 },
      { header: 'Дата поступления', key: 'purchaseDate', width: 20 },
      { header: 'Ответственный', key: 'assignedTo', width: 25 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    equipment.forEach(item => {
      worksheet.addRow({
        name: item.name,
        inventoryNumber: item.inventoryNumber,
        model: item.model,
        category: item.category ? item.category.name : '',
        status: item.status ? item.status.name : '',
        location: item.location,
        purchaseDate: item.purchaseDate
          ? new Date(item.purchaseDate).toLocaleDateString('ru-RU')
          : '',
        assignedTo: item.assignedTo ? item.assignedTo.name : '',
      });
    });

    // Add summary row
    worksheet.addRow({});
    const totalRow = worksheet.addRow({
      name: `Всего: ${equipment.length} ед.`,
    });
    totalRow.font = { bold: true };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer() as Buffer;
    return buffer;
  }

  async generateRequestsReport(params: any): Promise<Buffer> {
    const {
      statusIds,
      typeIds,
      assignedToIds,
      dateFrom,
      dateTo,
    } = params;

    const query: any = {
      relations: ['type', 'status', 'priority', 'createdBy', 'assignedTo', 'equipment'],
      order: { createdAt: 'DESC' },
    };

    if (statusIds && statusIds.length > 0) {
      query.where = { ...query.where, statusId: In(statusIds) };
    }

    if (typeIds && typeIds.length > 0) {
      query.where = { ...query.where, typeId: In(typeIds) };
    }

    if (assignedToIds && assignedToIds.length > 0) {
      query.where = { ...query.where, assignedToId: In(assignedToIds) };
    }

    if (dateFrom || dateTo) {
      query.where = {
        ...query.where,
        createdAt: Between(
          dateFrom ? new Date(dateFrom) : new Date('1900-01-01'),
          dateTo ? new Date(dateTo) : new Date()
        )
      };
    }

    const requests = await this.requestRepository.find(query);

    // Create Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Заявки');

    // Define columns
    worksheet.columns = [
      { header: '№ заявки', key: 'number', width: 15 },
      { header: 'Тема', key: 'title', width: 30 },
      { header: 'Тип', key: 'type', width: 20 },
      { header: 'Статус', key: 'status', width: 15 },
      { header: 'Приоритет', key: 'priority', width: 15 },
      { header: 'Создана', key: 'createdAt', width: 20 },
      { header: 'Завершена', key: 'completedAt', width: 20 },
      { header: 'Создал', key: 'createdBy', width: 25 },
      { header: 'Исполнитель', key: 'assignedTo', width: 25 },
      { header: 'Оборудование', key: 'equipment', width: 30 },
      { header: 'Местоположение', key: 'location', width: 25 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    requests.forEach(item => {
      worksheet.addRow({
        number: item.number,
        title: item.title,
        type: item.type ? item.type.name : '',
        status: item.status ? item.status.name : '',
        priority: item.priority ? item.priority.name : '',
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('ru-RU')
          : '',
        completedAt: item.completedAt
          ? new Date(item.completedAt).toLocaleDateString('ru-RU')
          : '',
        createdBy: item.createdBy ? item.createdBy.name : '',
        assignedTo: item.assignedTo ? item.assignedTo.name : '',
        equipment: item.equipment ? item.equipment.name : '',
        location: item.location,
      });
    });

    // Add summary row
    worksheet.addRow({});
    const totalRow = worksheet.addRow({
      number: `Всего: ${requests.length} заявок`,
    });
    totalRow.font = { bold: true };

    // Add statistics worksheet
    const statsWorksheet = workbook.addWorksheet('Статистика');

    // Status statistics
    statsWorksheet.addRow(['Статистика по статусам']);
    statsWorksheet.addRow(['Статус', 'Количество', 'Процент']);

    // Fix the typing issue with object indexing
    const statusStats: Record<string, number> = {};
    requests.forEach(request => {
      const statusName = request.status ? request.status.name : 'Не указан';
      statusStats[statusName] = (statusStats[statusName] || 0) + 1;
    });

    Object.entries(statusStats).forEach(([status, count]) => {
      const percent = (count / requests.length * 100).toFixed(1);
      statsWorksheet.addRow([status, count, `${percent}%`]);
    });

    // Type statistics
    statsWorksheet.addRow([]);
    statsWorksheet.addRow(['Статистика по типам']);
    statsWorksheet.addRow(['Тип', 'Количество', 'Процент']);

    // Fix the typing issue with object indexing
    const typeStats: Record<string, number> = {};
    requests.forEach(request => {
      const typeName = request.type ? request.type.name : 'Не указан';
      typeStats[typeName] = (typeStats[typeName] || 0) + 1;
    });

    Object.entries(typeStats).forEach(([type, count]) => {
      const percent = (count / requests.length * 100).toFixed(1);
      statsWorksheet.addRow([type, count, `${percent}%`]);
    });

    // Format statistics worksheet
    statsWorksheet.getColumn(1).width = 25;
    statsWorksheet.getColumn(2).width = 15;
    statsWorksheet.getColumn(3).width = 15;

    // Generate buffer and fix the Buffer type issue
    const buffer = await workbook.xlsx.writeBuffer() as Buffer;
    return buffer;
  }
}
