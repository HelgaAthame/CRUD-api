"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os_1 = require("os");
const dotenv = __importStar(require("dotenv"));
const server_1 = require("./server");
const http_1 = require("http");
const inMemeryDataBase_1 = require("./inMemeryDataBase");
const errorMessages_1 = require("./errorMessages");
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
console.log(args);
if (args.length > 2 && args.at(-1) === 'multi') {
    const numberCPUs = (0, os_1.cpus)().length;
    const workers = new Array(numberCPUs);
    if (cluster_1.default.isPrimary) {
        inMemeryDataBase_1.dataBase.listen(dbPort);
        for (let i = 0; i < numberCPUs; i += 1) {
            workers[i] = cluster_1.default.fork({
                WORKER_PORT: port + i + 1,
            });
        }
        cluster_1.default.on('exit', (worker, code) => {
            console.log(`Worker ${worker.id} finished. Exit code: ${code}`);
        });
        let count = 1;
        const balancer = (0, http_1.createServer)((req, res) => {
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
                        const reqToWorker = (0, http_1.request)(options, (resFromWorker) => {
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
                            console.error(errorMessages_1.serverError);
                        });
                        reqToWorker.write(primaryData);
                        reqToWorker.end();
                    }
                    catch (e) {
                        res.statusCode = 500;
                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(errorMessages_1.serverError));
                    }
                    if (count++ === numberCPUs)
                        count = 1; //round robin
                });
            }
            catch (e) {
                res.statusCode = 500;
                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                res.end(errorMessages_1.serverError);
            }
        });
        balancer.listen(port, () => {
            console.log(`Primary is running at PORT ${port}`);
        });
    }
    else if (cluster_1.default.isWorker) {
        port = Number(process.env.WORKER_PORT);
        console.log(`Worker ${(_a = cluster_1.default.worker) === null || _a === void 0 ? void 0 : _a.id} launched at PORT ${port}`);
        server_1.server.listen(port);
    }
}
else {
    inMemeryDataBase_1.dataBase.listen(dbPort);
    process.env.WORKER_PORT = '4000';
    server_1.server.listen(port, () => {
        console.log(`Server is running at PORT ${port}`);
    });
}
