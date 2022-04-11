import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'it_wall',
  entities: [__dirname + '/**/entity/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: true,
};
