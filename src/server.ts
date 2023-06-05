import { createServer, request } from "http";
import * as url from 'url';
import { User } from './userInterface';
import { database } from './inMemeryDataBase';
import uuid from 'node-uuid';
import { postToDb } from "./postToDb";
import { invalidBody, invalidId, invalidUrl, notExist, resourseDoesntExist, serverError } from "./errorMessages";

const endPoint = '/api/users';
const idRegEx = /[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
const dbPort = Number(process.env.DBPORT) || 3000;
const ourPort = Number(process.env.WORKER_PORT) || 4000;

  export const server = createServer((req, res) => {
    console.log(`Processing ${req.method} request on port ${ourPort}`);
    const optionsGet = {
      port: dbPort,
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      },
    };

    const getReqToDataBase = request(optionsGet, (resFromDataBase) => {
      let dataFromBase = '';
        resFromDataBase.on('data', (chunk) => {
          dataFromBase += chunk;
        });
        resFromDataBase.on('end', () => {
          let actualUsers = JSON.parse(dataFromBase);
          database.setAllUsers(actualUsers);



    try {

      const myUrl = url.parse(req.url as string, true);

      if (!myUrl?.path?.startsWith(endPoint)) {
        res.statusCode = 404;
        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
        res.end(resourseDoesntExist);
      } else {

        switch (req.method) {
          case 'GET':
            if (myUrl.path === endPoint) {
              const users: User[] = database.getAllUsers();
              res.statusCode = 200;
              res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(users));

            } else if (myUrl.path?.startsWith(`${endPoint}/`)) {

              const findUserId: string[] | null = myUrl.path?.match(idRegEx);

              if (findUserId == null) {
                res.statusCode = 400;
                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                res.end(invalidId);

              } else {
                const strFindId = JSON.stringify(findUserId[0]);

                const user = database.getUserById(strFindId);

                if (user === null) {
                  res.statusCode = 404;
                  res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                  res.end(notExist);
                } else {
                  res.statusCode = 200;
                  res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(user));
                }
              }

            } else if (!myUrl.path?.startsWith(`${endPoint}/`)) {
              res.statusCode = 404;
              res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
              res.end(resourseDoesntExist);
            }
            break;

          case 'POST':
            let data = '';
            req.on('data', chunk => {
              data += chunk;
            });
            req.on('end', () => {

              try {
                const newUser: User = JSON.parse(data);
                if (!newUser.username || !newUser.age || !newUser.hobbies) {
                  res.statusCode = 400;
                  res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                  res.end(invalidBody);
                } else {
                  if (myUrl.path === endPoint || myUrl.path === `${endPoint}/`) {
                    newUser.id = uuid.v1();
                    database.createUser(newUser);

                    /*postToDb();*/
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
                    const postReqToDataBase = request(optionsPost, (resFromDataBase) => {
                      resFromDataBase.on('data', (chunk) => {
                        console.log(`BODY: ${chunk}`);
                      });
                      resFromDataBase.on('end', () => {
                        res.statusCode = 201;
                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(newUser));
                      });
                    });
                    postReqToDataBase.write(postData);
                    postReqToDataBase.end();

                  } else {
                    res.statusCode = 400;
                    res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                    res.end('URL is invalid');
                  }
                }
              } catch (e) {
                res.statusCode = 500;
                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                res.end(serverError);
              }
            });
            break;

          case 'PUT':
            let putData = '';
            req.on('data', chunk => {
              putData += chunk;
            });
            req.on('end', () => {
              try {
                const newUser: User = JSON.parse(putData);

                if (!newUser.username || !newUser.age || !newUser.hobbies) {
                  res.statusCode = 400;
                  res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                  res.end(invalidBody);
                } else {

                  if (myUrl.path?.startsWith(`${endPoint}/`)) {
                    const findUserId = myUrl.path?.match(idRegEx) as string[];

                    if (findUserId == null) {
                      res.statusCode = 400;
                      res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                      res.end(invalidId);
                    } else {

                      const strFindId = JSON.stringify(findUserId[0]);
                      if (database.getAllUsers().length === 0) {
                        res.statusCode = 404;
                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                        res.end(notExist);
                      } else {

                        const user = database.getUserById(strFindId);
                        if (user === null) {
                          res.statusCode = 404;
                          res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                          res.end(notExist);
                        } else {
                          const updatedUser = database.updateUser(newUser, strFindId);

                          postToDb();

                          res.statusCode = 200;
                          res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                          res.end(JSON.stringify(updatedUser));
                        }
                      }
                    }
                  } else {
                    res.statusCode = 400;
                    res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                    res.end(invalidUrl);
                  }
                }
              } catch (e) {
                res.statusCode = 500;
                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                res.end(serverError);
              }
            });
            break;

          case 'DELETE':
            if (req.url?.startsWith(endPoint)) {
              if (myUrl.path === endPoint || myUrl.path === `${endPoint}/`) {
                res.statusCode = 400;
                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                res.end(invalidUrl);
              } else {
                const findUserId: string[] | null = myUrl.path?.match(idRegEx);

                if (findUserId == null) {
                  res.statusCode = 400;
                  res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                  res.end(invalidId);
                } else {

                  const strFindId = JSON.stringify(findUserId[0]);
                  if (database.getAllUsers().length === 0) {
                    res.statusCode = 404;
                    res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                    res.end(notExist);
                  } else {

                    const user = database.getUserById(strFindId);
                    if (user === null) {
                      res.statusCode = 404;
                      res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                      res.end(notExist);
                    } else {
                      database.deleteUserById(strFindId);

                      /*postToDb();*/
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
                    const postReqToDataBase = request(optionsPost, (resFromDataBase) => {
                      resFromDataBase.on('data', (chunk) => {
                        console.log(`BODY: ${chunk}`);
                      });
                      resFromDataBase.on('end', () => {
                        res.statusCode = 204;
                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                        res.end();
                      });
                    });
                    postReqToDataBase.write(postData);
                    postReqToDataBase.end();
                    }
                  }
                }
              }
            } else {
              res.statusCode = 400;
              res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
              res.end(invalidUrl);
            }
            break;
        }

      }
    } catch (e) {
      res.statusCode = 500;
      res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
      res.end(serverError);
    }


        });
    });

    getReqToDataBase.on('error', (e) => {
      console.error(e);
    });
    getReqToDataBase.end();

  });
