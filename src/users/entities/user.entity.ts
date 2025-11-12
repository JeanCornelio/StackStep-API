import { UserFrom, UserRoles } from 'src/enums/user';
import * as bcrypt from 'bcrypt';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  username: string;

  @Column('text', { nullable: true })
  avatar: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text')
  @Exclude()
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
