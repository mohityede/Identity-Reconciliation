import express from "express";
import dotenv from "dotenv";

import dbConn from "./database.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 7000;

const res = await dbConn.query("select * from EMPLOYEE");
console.log(res);

app.get("/", (req, res) => {
  res.status(200).json({ massage: "Hllow mohite!!" });
});

app.listen(port, () => {
  console.log(`server is running on port:${port}`);
});
