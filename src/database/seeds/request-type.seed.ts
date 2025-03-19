import { AppDataSource } from '../../ormconfig';
import { RequestType } from '../../requests/entities/request-type.entity';
import { DataSource } from 'typeorm';

export async function RequestTypeSeed(dataSource: DataSource) {
  const requestTypeRepository = dataSource.getRepository(RequestType);

  // Проверяем, есть ли уже типы заявок в базе
  const count = await requestTypeRepository.count();
  if (count > 0) {
    console.log('Request types already exist, skipping seed');
    return;
  }

  // Создаем типы заявок
  const types = requestTypeRepository.create([
    {
      name: 'Ремонт',
      description: 'Заявка на починку оборудования',
      color: '#dc3545', // красный
    },
    {
      name: 'Заправка картриджа',
      description: 'Запрос на заправку картриджа принтера',
      color: '#17a2b8', // голубой
    },
    {
      name: 'Утилизация',
      description: 'Запрос на списание и утилизацию оборудования',
      color: '#ffc107', // желтый
    },
    {
      name: 'Перемещение',
      description: 'Запрос на перемещение оборудования',
      color: '#28a745', // зеленый
    },
  ]);

  // Сохраняем типы
  await requestTypeRepository.save(types);

  console.log('Request type seed completed');
}
