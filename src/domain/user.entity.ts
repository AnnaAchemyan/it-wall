import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsString } from 'class-validator';

export enum Role {
  Freelancer = 'freelancer',
  Customer = 'customer',
  Company = 'company',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @Column({ type: 'varchar', length: '30' })
  firstName: string;

  @IsString()
  @Column({ type: 'varchar', length: '30' })
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @IsString()
  @Column({ type: 'varchar', length: '254' })
  email: string;

  @IsString()
  @Column()
  password: string;

  @Column({ default: false })
  remember: boolean;

  @Column({
    type: 'enum',
    enum: Role,
  })
  public role: Role;

  @Column({ default: false })
  isActive: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt?: string;
}
