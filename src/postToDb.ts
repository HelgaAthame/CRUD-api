import { database } from "./inMemeryDataBase";
import { request } from 'http';

const dbPort = Number(process.env.DBPORT) || 3000;

export const postToDb = () => {
  const allUsers = database.getAllUsers();
  const postData = JSON.stringify(allUsers);
  const optionsPost = {
    port: dbPort,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
    },
  };
  const postReqToDataBase = request(optionsPost);
  postReqToDataBase.write(postData);
  postReqToDataBase.end();
};
