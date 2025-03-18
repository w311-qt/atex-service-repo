import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';

// Импорты других сущностей будут добавлены позже
// import { Request } from '../../requests/entities/request.entity';

// Определяем перечисление для ролей пользователей
export enum UserRole {
  USER = 'user',
  TECHNICIAN = 'technician',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // Исключаем пароль из ответов API для безопасности
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  position: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Связи с другими сущностями будут добавлены позже
  // @OneToMany(() => Request, (request) => request.createdBy)
  // createdRequests: Request[];

  // @OneToMany(() => Request, (request) => request.assignedTo)
  // assignedRequests: Request[];
}