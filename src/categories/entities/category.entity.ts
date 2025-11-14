//import { Goal } from 'src/goals/entities/goal.entity';

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  //OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @OneToMany(() => Goal, (goal) => goal.category)
  // goal: Goal;

  @Column('text')
  name: string;

  @Column('text')
  description: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
