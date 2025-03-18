import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Request } from './request.entity';

@Entity('request_statuses')
export class RequestStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  color: string;

  @OneToMany(() => Request, (request) => request.status)
  requests: Request[];
}
