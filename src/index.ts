import cluster from 'cluster';
import { createServer } from "http";
import { cpus } from 'os';
import * as url from 'url';
import { dirname, resolve } from 'path';
import { readFile, writeFile } from 'fs';
let uuid = require('node-uuid');

interface User {
  id: string | string[] | undefined,
  name: string,
  age: number,
  hobbies: string[],
}

const host = 'localhost';
let port = Number(process.env.PORT) || 4000;
const endPoint = '/api/users';
let users: User[];
readFile('src/data.json', (err, data) => {
  users = JSON.parse(data.toString());
})
const idRegEx = /[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;

const args = process.argv;

const server = createServer((req, res) => {
  try {
    const myUrl = url.parse(req.url as string, true);

    if (!myUrl?.path?.startsWith(endPoint)) {
      res.statusCode = 404;
      res.end(`Requested resource doesn\'t exist`);
    } else

    if (req.method === 'GET') {

      if (myUrl.path === endPoint) {
        readFile('src/data.json', (err, data) => {
          users = JSON.parse(data.toString());
          res.statusCode = 200;
          res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(users as User[]));
        })

      } else if (myUrl.path?.startsWith(`${endPoint}/`)) {

        const findUserId: string[] | null = myUrl.path?.match(idRegEx);

        if (findUserId == null) {
          res.statusCode = 400;
          res.end('User ID is invalid (not uuid)');

        } else {
          const strFindId = JSON.stringify(findUserId[0]);
          readFile('src/data.json', (err, data) => {
            users = JSON.parse(data.toString());
            if (users.length === 0) {
              res.statusCode = 404;
              res.end('Record with any userId doesn\'t exist');
            } else {
              users.forEach((user, i) => {

                const strUserId = JSON.stringify(user.id as string);
                if (strFindId === strUserId) {
                  res.statusCode = 200;
                  res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(user));
                } else {
                  if (i === users.length - 1 && strFindId !== strUserId) {
                    res.statusCode = 404;
                    res.end('Record with this userId doesn\'t exist');
                  }
                }
              });
            }
          })

        }

      } else if (!myUrl.path?.startsWith(`${endPoint}/`)) {
        res.statusCode = 404;
        res.end(`Requested resource doesn\'t exist. please correct url.`);
      }

    } else if (req.method === 'POST') {

      let data = '';

      req.on('data', chunk => {
        data += chunk;
      });

      req.on('end', () => {
        try {
          const newUser: User = JSON.parse(data);
          if (!newUser.name || !newUser.age || !newUser.hobbies) {
            res.statusCode = 400;
            res.end('Request body does not contain required fields');
          } else {
            if (myUrl.path === endPoint || myUrl.path === `${endPoint}/`) {
              newUser.id = uuid.v1();
              users.push(newUser);
              writeFile('src/data.json', JSON.stringify(users), (err) => {
                if (err) throw new Error('Error while writing users');
              });
              res.statusCode = 201;
              res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(users.at(-1)));
            } else {
              res.statusCode = 400;
              res.end('URL is invalid');
            }
          }
        } catch (e) {
          res.statusCode = 500;
          res.end(`Sorry... Errors on the server side occur during the processing of your request. \n Please, try again`);
        }
      });

    } else if (req.method === 'PUT') {
      //
      let data = '';

      req.on('data', chunk => {
        data += chunk;
      });

      req.on('end', () => {
        try {

          const newUser: User = JSON.parse(data);

          if (!newUser.name || !newUser.age || !newUser.hobbies) {
            res.statusCode = 400;
            res.end('Request body does not contain required fields');

          } else {

            if (myUrl.path?.startsWith(`${endPoint}/`)) {

              const findUserId = myUrl.path?.match(idRegEx) as string[];
              if (findUserId == null) {
                res.statusCode = 400;
                res.end('User ID is invalid (not uuid)');

              } else {
                const strFindId = JSON.stringify(findUserId[0]);

                if (users.length === 0) {
                  res.statusCode = 404;
                  res.end('Record with any userId doesn\'t exist');
                }

                for (let i = 0; i < users.length; i += 1) {
                  const strUserId = JSON.stringify(users[i].id as string);
                  if (strFindId == strUserId) {
                    users[i] = {
                      id: users[i].id,
                      name: newUser.name,
                      age: newUser.age,
                      hobbies: newUser.hobbies
                    };
                    writeFile('src/data.json', JSON.stringify(users), (err) => {
                      if (err) throw new Error('Error while writing users');
                    });
                    res.statusCode = 200;
                    res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(users[i]));

                  } else {
                    if (i === users.length - 1 && strFindId !== strUserId) {
                      res.statusCode = 404;
                      res.end('Record with this userId doesn\'t exist');

                    }
                  }
                }

              }
            } else {
              res.statusCode = 400;
              res.end('URL is invalid');
            }
          }
        } catch (e) {
          res.statusCode = 500;
          res.end(`Sorry... Errors on the server side occur during the processing of your request. \n Please, try again`);
        }
      });
      //

    } else if (req.method === 'DELETE' && req.url?.startsWith(endPoint)) {
      if (myUrl.path === endPoint || myUrl.path === `${endPoint}/`) {
        res.statusCode = 400;
        res.end('URL is invalid');
      } else {
        const findUserId: string[] | null = myUrl.path?.match(idRegEx);

        if (findUserId == null) {
          res.statusCode = 400;
          res.end('User ID is invalid (not uuid)');

        } else {
          const strFindId = JSON.stringify(findUserId[0]);

          if (users.length === 0) {
            res.statusCode = 404;
            res.end('Record with any userId doesn\'t exist');
          } else {


            for (let i = 0; i < users.length; i += 1) {
              const strUserId = JSON.stringify(users[i].id as string);
              if (strFindId == strUserId) {
                users.splice(i, 1);
                writeFile('src/data.json', JSON.stringify(users), (err) => {
                  if (err) throw new Error('Error while writing users');
                });
                res.statusCode = 204;
                res.end('Record was deleted');

              } else {
                if (i === users.length - 1 && strFindId !== strUserId) {
                  res.statusCode = 404;
                  res.end('Record with this userId doesn\'t exist');

                }
              }
            }

          }
        }
      }
    }
  } catch (e) {
    res.statusCode = 500;
    res.end(`Sorry... Errors on the server side that occur during the processing of your request. \n Please, try again`);
  }
});


if (args.length > 2 && args[2] === '--cluster=enable') {
  const numberCPUs: number = cpus().length;

  if (cluster.isPrimary) {
    console.log(`Server running at PORT ${port}`);
    for (let i = 0; i < numberCPUs; i += 1) {
      cluster.fork({WORKER_PORT: port + i + 1});
    }

    cluster.on('exit', (worker, code): void => {
      writeFile('src/data.json', "[]", (err) => {
        if (err) throw new Error('Error while writing users');
      });
      console.log(
        `Worker ${worker.id} finished. Exit code: ${code}`
      );
    });

    cluster.on('message', async (worker, message) => {
      console.log(message);
    });
  } else if (cluster.isWorker) {
    port = Number(process.env.WORKER_PORT);
    console.log(`Worker ${cluster.worker?.id} launched at PORT ${port}`);
    server.listen(port);
    process.on('message', (message) => {

    })
  }
} else {
  server.listen(port, () => {
    console.log(`Server running at PORT ${port}`);
  });
}
