import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Status } from './status.entity';
import { User } from '../../users/entities/user.entity';

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  model: string;

  @Column({ unique: true })
  inventoryNumber: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  image: string;

  @ManyToOne(() => Category, (category) => category.equipment)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: string;

  @ManyToOne(() => Status, (status) => status.equipment)
  @JoinColumn({ name: 'statusId' })
  status: Status;

  @Column()
  statusId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @Column({ nullable: true })
  assignedToId: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true, type: 'date' })
  purchaseDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
