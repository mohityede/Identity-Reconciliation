import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2";
import dbConn from "./database.js";
import { RequestData, ResponseObject } from "./types.js";

export const getResponseObj = async (primaryId: number) => {
  const [primaryObj]: [QueryResult: RowDataPacket[], FieldPacket[]] =
    await dbConn.query(`select * from Contact where id=?`, [primaryId]);
  const [secondaryObj]: [QueryResult: RowDataPacket[], FieldPacket[]] =
    await dbConn.query(`select * from Contact where linkedId=?`, [primaryId]);
  let emails = [primaryObj[0].email];
  let phoneNumbers = [primaryObj[0].phoneNumber];
  let secondaryContactIds: number[] = [];
  secondaryObj.forEach((curr) => {
    if (!emails.includes(curr.email)) emails.push(curr.email);
    if (!phoneNumbers.includes(curr.phoneNumber))
      phoneNumbers.push(curr.phoneNumber);
    secondaryContactIds.push(curr.id);
  });
  const returnData: ResponseObject = {
    primaryContatctId: primaryObj[0].id,
    emails,
    phoneNumbers,
    secondaryContactIds,
  };
  return returnData;
};

export const getData = async (field: string, reqData: RequestData) => {
  const dataPoint =
    field === "phoneNumber" ? reqData.phoneNumber : reqData.email;
  let responsePrimaryId: number;
  const [contacts]: [QueryResult: RowDataPacket[], FieldPacket[]] =
    await dbConn.query(
      `select * from Contact
        where ${field}=?
        order by createdAt asc`,
      dataPoint
    );
  if (contacts.length === 0) {
    const [insertMetaData]: [QueryResult: ResultSetHeader, FieldPacket[]] =
      await dbConn.query(`insert into Contact(${field}) values (?)`, [
        dataPoint,
      ]);
    responsePrimaryId = insertMetaData.insertId;
    const data = getResponseObj(responsePrimaryId);
    return data;
  }
  if (contacts[0].linkPrecedence === "primary") {
    responsePrimaryId = contacts[0].id;
  } else {
    responsePrimaryId = contacts[0].linkedId;
  }
  const data = await getResponseObj(responsePrimaryId);
  return data;
};
