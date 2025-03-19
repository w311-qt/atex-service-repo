import { DataSource } from 'typeorm';
import { Status } from '../../equipment/entities/status.entity';

export async function StatusSeed(dataSource: DataSource) {
  const statusRepository = dataSource.getRepository(Status);

  // Проверяем, есть ли уже статусы в базе
  const count = await statusRepository.count();
  if (count > 0) {
    console.log('Statuses already exist, skipping seed');
    return;
  }

  // Создаем статусы оборудования
  const statuses = statusRepository.create([
    {
      name: 'Новый',
      description: 'Только поступившее оборудование',
      color: '#17a2b8', // голубой
    },
    {
      name: 'Рабочее',
      description: 'Оборудование в исправном состоянии',
      color: '#28a745', // зеленый
    },
    {
      name: 'Дефектное',
      description: 'Оборудование с неисправностями, требующее ремонта',
      color: '#ffc107', // желтый
    },
    {
      name: 'Нерабочее',
      description: 'Оборудование, не подлежащее ремонту',
      color: '#dc3545', // красный
    },
  ]);

  // Сохраняем статусы
  await statusRepository.save(statuses);

  console.log('Status seed completed');
}
