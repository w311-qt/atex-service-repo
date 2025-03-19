import { RequestStatus } from '../../requests/entities/request-status.entity';
import { DataSource } from 'typeorm';

export async function RequestStatusSeed(dataSource: DataSource) {
  const requestStatusRepository = dataSource.getRepository(RequestStatus);

  // Проверяем, есть ли уже статусы заявок в базе
  const count = await requestStatusRepository.count();
  if (count > 0) {
    console.log('Request statuses already exist, skipping seed');
    return;
  }

  // Создаем статусы заявок
  const statuses = requestStatusRepository.create([
    {
      name: 'Новая',
      description: 'Только что созданная заявка',
      color: '#17a2b8', // голубой
    },
    {
      name: 'В работе',
      description: 'Заявка взята в работу техником',
      color: '#007bff', // синий
    },
    {
      name: 'Ожидает',
      description: 'Заявка ожидает действий со стороны заявителя или техника',
      color: '#ffc107', // желтый
    },
    {
      name: 'Выполнена',
      description: 'Заявка успешно выполнена',
      color: '#28a745', // зеленый
    },
    {
      name: 'Отменена',
      description: 'Заявка отменена',
      color: '#dc3545', // красный
    },
  ]);

  // Сохраняем статусы
  await requestStatusRepository.save(statuses);

  console.log('Request status seed completed');
}
