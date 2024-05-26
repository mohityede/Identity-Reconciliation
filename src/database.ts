import mysql2 from "mysql2";
import { databaseConfig } from "./config.js";

const dbConnectionPool = mysql2.createPool(databaseConfig);

export default dbConnectionPool.promise();
