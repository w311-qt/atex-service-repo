// src/ormconfig.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './users/entities/user.entity';
import { Category } from './equipment/entities/category.entity';
import { Status } from './equipment/entities/status.entity';
import { Equipment } from './equipment/entities/equipment.entity';
import { RequestType } from './requests/entities/request-type.entity';
import { RequestStatus } from './requests/entities/request-status.entity';
import { RequestPriority } from './requests/entities/request-priority.entity';
import { Request } from './requests/entities/request.entity';
import { RequestActivity } from './requests/entities/request-activity.entity';

// Загружаем переменные окружения
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'atex_equipment_db',
  entities: [
    User,
    Category,
    Status,
    Equipment,
    RequestType,
    RequestStatus,
    RequestPriority,
    Request,
    RequestActivity,
  ],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false, // В продакшене всегда должно быть false!
  logging: process.env.NODE_ENV === 'development',
});
