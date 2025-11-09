import { UserFrom, UserRoles } from 'src/enums/user';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  username: string;

  @Column('text', { nullable: true })
  avatar: string;

  @Column('text')
  email: string;

  @Column('text')
  password: string;

  @Column({
    type: 'enum',
    array: true,
    enum: UserRoles,
    default: [UserRoles.USER],
  })
  roles: UserRoles[];

  @Column({
    type: 'enum',
    enum: UserFrom,
    default: UserFrom.DEFAULT,
  })
  from: UserFrom;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;
}
