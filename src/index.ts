import dotenv from "dotenv";
import express, { Request } from "express";
import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2";

import dbConn from "./database.js";
import { RequestData } from "./types.js";
import { getData, getResponseObj } from "./utils.js";

const app = express();
const port = process.env.PORT || 7000;

dotenv.config();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ massage: "Welcome to Identity-Reciliatioin!!!" });
});

app.post("/identify", async (req: Request<{}, {}, RequestData>, res) => {
  const reqData = {
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
  };
  if (!reqData.email && !reqData.phoneNumber)
    return res
      .status(400)
      .json({ message: "Please send right data, both fields are null" });

  if (reqData.email === null) {
    const ans = await getData("phoneNumber", reqData);
    return res.status(200).json({ contact: ans });
  } else if (reqData.phoneNumber === null) {
    const ans = await getData("email", reqData);
    return res.status(200).json({ contact: ans });
  }

  // both are valid input
  let responsePrimaryId: number;
  const [contacts]: [QueryResult: RowDataPacket[], FieldPacket[]] =
    await dbConn.query(
      `SELECT * FROM Contact
      WHERE email=? AND phoneNumber=?;`,
      [reqData.email, reqData.phoneNumber]
    );

  if (contacts.length !== 0) {
    let responsePrimaryId: number =
      contacts[0].linkPrecedence === "primary"
        ? contacts[0].id
        : contacts[0].linkedId;

    const data = await getResponseObj(responsePrimaryId);
    return res.status(200).json({ contact: data });
  }

  // check data available for any of the field
  const [filteredContacts]: [QueryResult: RowDataPacket[], FieldPacket[]] =
    await dbConn.query(
      `SELECT * FROM Contact
      WHERE email=? OR phoneNumber=?
      ORDER BY createdAt ASC;`,
      [reqData.email, reqData.phoneNumber]
    );
  if (filteredContacts.length === 0) {
    const [insertMetaData]: [QueryResult: ResultSetHeader, FieldPacket[]] =
      await dbConn.query(
        `INSERT INTO Contact(phoneNumber,email) VALUES (?,?);`,
        [reqData.phoneNumber, reqData.email]
      );
    responsePrimaryId = insertMetaData.insertId;
    const data = await getResponseObj(responsePrimaryId);
    return res.status(201).json({ contact: data });
  }
  responsePrimaryId = filteredContacts[0].id;
  let containsNumber = false,
    containsEmail = false;
  filteredContacts.forEach((curr) => {
    if (curr.email === reqData.email) containsEmail = true;
    if (curr.phoneNumber === reqData.phoneNumber) containsNumber = true;
  });

  if (containsNumber && containsEmail) {
    for (let i = 1; i < filteredContacts.length; i++) {
      await dbConn.query(
        `UPDATE Contact SET linkedId=?, linkPrecedence=? WHERE id=?;`,
        [responsePrimaryId, "secondary", filteredContacts[i].id]
      );
    }
  } else {
    await dbConn.query(
      `INSERT INTO Contact(phoneNumber,email,linkedId,linkPrecedence) VALUES(?,?,?,?);`,
      [reqData.phoneNumber, reqData.email, responsePrimaryId, "secondary"]
    );
  }

  const data = await getResponseObj(responsePrimaryId);
  return res.status(201).json({ contact: data });
});

app.listen(port, () => {
  console.log(`server is running on port:${port}`);
});
