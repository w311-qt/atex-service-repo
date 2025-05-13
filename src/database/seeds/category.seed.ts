import { Category } from '../../equipment/entities/category.entity';
import { DataSource } from 'typeorm';

export async function CategorySeed(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(Category);

  const count = await categoryRepository.count();
  if (count > 0) {
    console.log('Categories already exist, skipping seed');
    return;
  }

  const categories = categoryRepository.create([
    {
      name: 'Мониторы',
      description: 'Устройства вывода изображения',
    },
    {
      name: 'Системные блоки',
      description: 'Корпуса компьютеров',
    },
    {
      name: 'Процессоры',
      description: 'CPU',
    },
    {
      name: 'Оперативная память',
      description: 'RAM модули',
    },
    {
      name: 'SSD накопители',
      description: 'Твердотельные накопители',
    },
    {
      name: 'HDD накопители',
      description: 'Жесткие диски',
    },
    {
      name: 'Материнские платы',
      description: 'Основные платы компьютеров',
    },
    {
      name: 'Блоки питания',
      description: 'Источники питания для компьютеров',
    },
    {
      name: 'UPS',
      description: 'Источники бесперебойного питания',
    },
    {
      name: 'Принтеры',
      description: 'Устройства для печати',
    },
    {
      name: 'Картриджи',
      description: 'Расходные материалы для принтеров',
    },
  ]);

  await categoryRepository.save(categories);

  console.log('Category seed completed');
}
