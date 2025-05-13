import { RequestPriority } from '../../requests/entities/request-priority.entity';
import { DataSource } from 'typeorm';

export async function RequestPrioritySeed(dataSource: DataSource) {
  const requestPriorityRepository = dataSource.getRepository(RequestPriority);

  const count = await requestPriorityRepository.count();
  if (count > 0) {
    console.log('Request priorities already exist, skipping seed');
    return;
  }

  const priorities = requestPriorityRepository.create([
    {
      name: 'Низкий',
      description: 'Заявка не требует срочного выполнения',
      color: '#28a745', // зеленый
    },
    {
      name: 'Средний',
      description: 'Стандартный приоритет',
      color: '#ffc107', // желтый
    },
    {
      name: 'Высокий',
      description: 'Требует быстрого выполнения',
      color: '#fd7e14', // оранжевый
    },
    {
      name: 'Критический',
      description: 'Требует немедленного внимания',
      color: '#dc3545', // красный
    },
  ]);

  await requestPriorityRepository.save(priorities);

  console.log('Request priority seed completed');
}
