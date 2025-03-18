import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Equipment } from './equipment.entity';

@Entity('equipment_statuses')
export class Status {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  color: string;

  @OneToMany(() => Equipment, (equipment) => equipment.status)
  equipment: Equipment[];
}
