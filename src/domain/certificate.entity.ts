import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Company } from './company.entity';

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  image: string;

  @ManyToOne(() => Company, (company) => company.certificate)
  company: Company;
}
