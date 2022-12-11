import { createServer } from "http";
import * as fs from 'fs';
import { resolve } from 'path';
import { readFile } from 'fs/promises';
import { parse } from 'url';

interface User {
  id: number,
  name: string,
  age: number,
  hobbies: string[],
}

const host = 'localhost';
const port = 4000;
const endPoint = '/api/users';
const users: User [] = [];

const main = async () => {
  const data = await readFile(resolve('data.json'), 'utf8');

  const server = createServer((req, res) => {

    const myUrl = parse(req.url as string, true);

console.log(myUrl);

    if (!myUrl?.path?.startsWith(endPoint)) {
      res.end(`Error code 404\n Incorrect link`);
    }
    if (req.method === 'GET') {
      if (myUrl.path === endPoint) {
        res.writeHead(200, "OK");
        res.end(JSON.stringify(users as User[]));
      } else if (myUrl.path?.startsWith(`${endPoint}/`)) {

      }
    } else if (req.method === 'POST' && req.url === endPoint) {

    } else if (req.method === 'PUT' && req.url?.startsWith(endPoint)) {

    } else if (req.method === 'DELETE' && req.url?.startsWith(endPoint)) {

    }
  });


  server.listen(port, host);
}

main();
