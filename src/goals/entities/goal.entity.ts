import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id)
  userId: User;

  @Column('text')
  title: string;

  @OneToMany(() => Category, (category) => category.uid)
  @JoinTable()
  category: Category[];

  @Column('int')
  targetHour: number;

  @Column('int')
  currentHours: number;

  @Column('numeric', { precision: 5, scale: 2 })
  percet: number;

  @Column('date')
  deadLine: Date;

  @Column('text')
  description: string;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;
}
