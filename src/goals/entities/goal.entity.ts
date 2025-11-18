import { Category } from 'src/categories/entities/category.entity';
import { GoalState } from 'src/enums/goal';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_Id' })
  user: User;

  @Column('text')
  title: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_Id' })
  category: Category;

  @Column('int')
  totalHours: number;

  @Column('int', { default: 0, nullable: true })
  currentHours: number;

  @Column('text', { default: '0.00' })
  percent: string;

  @Column('timestamp')
  dueDate: Date;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: GoalState,
    default: GoalState.ACTIVE,
  })
  state: GoalState;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
