import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Request } from './request.entity';
import { User } from '../../users/entities/user.entity';

export enum ActivityType {
  CREATE = 'create',
  UPDATE = 'update',
  STATUS_CHANGE = 'statusChange',
  COMPLETE = 'complete',
  CANCEL = 'cancel',
  ASSIGN = 'assign',
  COMMENT = 'comment',
}

@Entity('request_activities')
export class RequestActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requestId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  type: ActivityType;

  @Column({ nullable: true, type: 'text' })
  message: string;

  @Column({ nullable: true })
  oldValue: string | null;

  @Column({ nullable: true })
  newValue: string | null;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Request, (request) => request.activities)
  @JoinColumn({ name: 'requestId' })
  request: Request;
}
