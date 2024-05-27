import mysql2 from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const host: string = process.env.MYSQL_HOST as string;
const port: number = Number(process.env.MYSQL_PORT);
const user: string = process.env.MYSQL_USER as string;
const password: string = process.env.MYSQL_PASSWORD as string;
const database: string = process.env.MYSQL_DATABASE as string;

const dbConnectionPool = mysql2.createPool({
  host,
  port,
  user,
  password,
  database,
});

export default dbConnectionPool.promise();
