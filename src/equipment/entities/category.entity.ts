import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Equipment } from './equipment.entity';


@Entity('equipment_categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Equipment, (equipment) => equipment.category)
  equipment: Equipment[];
}
