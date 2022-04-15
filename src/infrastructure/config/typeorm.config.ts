import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +process.env.DB_PORT || 5432,
  username: process.env.DB_USER_NAME || 'postgres',
  password: process.env.DB_USER_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'it_wall',
  entities: [__dirname + '/**/entity/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: true,
};
