import { DataSource } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function UserSeed(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const count = await userRepository.count();
  if (count > 0) {
    console.log('Users already exist, skipping seed');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = userRepository.create({
    name: 'Администратор',
    email: 'admin@example.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
    department: 'IT',
    position: 'Администратор системы',
    isActive: true,
  });

  const technician = userRepository.create({
    name: 'Техник',
    email: 'tech@example.com',
    password: hashedPassword,
    role: UserRole.TECHNICIAN,
    department: 'IT',
    position: 'Техник по обслуживанию',
    isActive: true,
  });

  const user = userRepository.create({
    name: 'Пользователь',
    email: 'user@example.com',
    password: hashedPassword,
    role: UserRole.USER,
    department: 'Маркетинг',
    position: 'Маркетолог',
    isActive: true,
  });

  await userRepository.save([admin, technician, user]);

  console.log('User seed completed');
}
