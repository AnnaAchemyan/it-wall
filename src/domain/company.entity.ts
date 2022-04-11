import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IsString } from 'class-validator';
import { User } from './user.entity';
import { Certificate } from './certificate.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @Column({ type: 'varchar', length: '30', nullable: true })
  companyName: string;

  @Column({ nullable: true })
  taxNumber: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToMany(() => Certificate, (certificate) => certificate.company)
  @JoinColumn()
  certificate: Certificate[];
}
