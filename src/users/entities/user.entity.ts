import { UserFrom, UserRoles } from 'src/enums/user';
import * as bcrypt from 'bcrypt';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Goal } from 'src/goals/entities/goal.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  username: string;

  @Column('text', { nullable: true })
  avatarUrl: string;

  //TODO: Create a way to normalize email and username when user is updating
  @Column('text', { unique: true })
  email: string;

  @Column('text', { nullable: true, select: false })
  password: string;

  @Column({
    type: 'enum',
    array: true,
    enum: UserRoles,
    default: [UserRoles.USER],
  })
  roles: string[];

  @Column({
    type: 'enum',
    enum: UserFrom,
    default: UserFrom.DEFAULT,
  })
  from: UserFrom;

  @ManyToOne(() => Goal, (goal) => goal.user)
  goal: Goal[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    const saltRounds = 12;
    const passwordhashed = await bcrypt.hash(this.password, saltRounds);
    this.password = passwordhashed;
  }
}
