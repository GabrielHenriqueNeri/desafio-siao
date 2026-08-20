import 'dotenv/config';
import { DataSource } from 'typeorm';

/**
 * DataSource usado pela CLI do TypeORM (migrations) e pelo script de seed.
 * A aplicação Nest monta a própria conexão em app.module.ts com os mesmos
 * parâmetros, via ConfigService.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'desafio_siao',
  entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
});
