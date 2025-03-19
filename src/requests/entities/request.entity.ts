import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Equipment } from '../../equipment/entities/equipment.entity';
import { RequestType } from './request-type.entity';
import { RequestStatus } from './request-status.entity';
import { RequestPriority } from './request-priority.entity';
import { RequestActivity } from './request-activity.entity';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => RequestType)
  @JoinColumn({ name: 'typeId' })
  type: RequestType;

  @Column()
  typeId: string;

  @ManyToOne(() => RequestStatus)
  @JoinColumn({ name: 'statusId' })
  status: RequestStatus;

  @Column()
  statusId: string;

  @ManyToOne(() => RequestPriority)
  @JoinColumn({ name: 'priorityId' })
  priority: RequestPriority;

  @Column()
  priorityId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @Column({ nullable: true })
  assignedToId: string;

  @ManyToOne(() => Equipment, { nullable: true })
  @JoinColumn({ name: 'equipmentId' })
  equipment: Equipment;

  @Column({ nullable: true })
  equipmentId: string;

  @Column({ nullable: true })
  cartridgeModel: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RequestActivity, (activity) => activity.request)
  activities: RequestActivity[];
}
