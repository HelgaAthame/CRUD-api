import cluster from 'cluster';
import { cpus } from 'os';
import * as dotenv from 'dotenv';
import { server } from './server';
import { createServer, request } from "http";
import { dataBase } from './inMemeryDataBase';
import { serverError } from './errorMessages';

dotenv.config();

process.on('uncaughtException', function (err) {
  console.log(err);
});

process.on('SIGINT', () => {
  setImmediate(() => process.exit(0));
});

const host = 'localhost';
let port = Number(process.env.PORT) || 4000;
const dbPort = Number(process.env.DBPORT) || 3000;
const args = process.argv;

if (args.length > 2 && args.at(-1) === 'multi') {
  const numberCPUs: number = cpus().length;
  const workers = new Array(numberCPUs);

  if (cluster.isPrimary) {

    dataBase.listen(dbPort);

    for (let i = 0; i < numberCPUs; i += 1) {
      workers[i] = cluster.fork({
        WORKER_PORT: port + i + 1,
      });
    }

    cluster.on('exit', (worker, code): void => {
      console.log(
        `Worker ${worker.id} finished. Exit code: ${code}`
      );
    });


    let count = 1;
    const balancer = createServer((req, res) => {
      try {
        let primaryData = '';
        req.on('data', chunk => {
          primaryData += chunk;
        });
        req.on('end', () => {

          try {
            const options = {
              port: Number(port) + count,
              path: req.url,
              method: req.method,
              headers: {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(primaryData),
              },
            };

            const reqToWorker = request(options, (resFromWorker) => {
              let dataFromWorker = '';
              resFromWorker.on('data', (chunk) => {
                dataFromWorker += chunk;
              });
              resFromWorker.on('end', () => {
                  res.statusCode = resFromWorker.statusCode || 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(dataFromWorker);
              });

            });
            reqToWorker.on('error', (e) => {
              console.error(serverError);
            });

            reqToWorker.write(primaryData);
            reqToWorker.end();

          } catch (e) {
            res.statusCode = 500;
            res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(serverError));
          }

          if (count++ === numberCPUs) count = 1;  //round robin
        });
      } catch(e) {
        res.statusCode = 500;
        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
        res.end(serverError);
      }
    })
    balancer.listen(port, () => {
      console.log(`Primary is running at PORT ${port}`);
    });

  } else if (cluster.isWorker) {
    port = Number(process.env.WORKER_PORT);
    console.log(`Worker ${cluster.worker?.id} launched at PORT ${port}`);
    server.listen(port);
  }
} else {
  dataBase.listen(dbPort);
  process.env.WORKER_PORT = '4000';
  server.listen(port, () => {
    console.log(`Server is running at PORT ${port}`);
  });
}
