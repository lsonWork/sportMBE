import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';
import { join } from 'path';

const isTs = __filename.endsWith('.ts'); // true khi chạy dev (ts-node)

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  url: process.env.DATABASE_URL_RENDER,
  ssl: true,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [join(__dirname, 'dist/**/*.entity.js')],
  migrations: [
    join(__dirname, isTs ? 'src/migrations/*.ts' : 'dist/migrations/*.js'),
  ],
});
