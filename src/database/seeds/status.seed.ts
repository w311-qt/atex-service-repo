import { DataSource } from 'typeorm';
import { Status } from '../../equipment/entities/status.entity';

export async function StatusSeed(dataSource: DataSource) {
  const statusRepository = dataSource.getRepository(Status);

  const count = await statusRepository.count();
  if (count > 0) {
    console.log('Statuses already exist, skipping seed');
    return;
  }

  const statuses = statusRepository.create([
    {
      name: 'Новый',
      description: 'Только поступившее оборудование',
      color: '#17a2b8',
    },
    {
      name: 'Рабочее',
      description: 'Оборудование в исправном состоянии',
      color: '#28a745',
    },
    {
      name: 'Дефектное',
      description: 'Оборудование с неисправностями, требующее ремонта',
      color: '#ffc107',
    },
    {
      name: 'Нерабочее',
      description: 'Оборудование, не подлежащее ремонту',
      color: '#dc3545',
    },
  ]);

  await statusRepository.save(statuses);

  console.log('Status seed completed');
}
