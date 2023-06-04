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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os_1 = require("os");
const dotenv = __importStar(require("dotenv"));
const server_1 = require("./server");
const http_1 = require("http");
dotenv.config();
const host = 'localhost';
let port = Number(process.env.PORT) || 4000;
const args = process.argv;
if (args.length > 2 && args[2] === 'multi') {
    const numberCPUs = (0, os_1.cpus)().length;
    const workers = new Array(numberCPUs);
    if (cluster_1.default.isPrimary) {
        let count = 0;
        const balancer = (0, http_1.createServer)((req, res) => {
            console.log(req);
            console.log(`req.url ${req.url}`);
            const postData = JSON.stringify({
                'msg': 'Hello World!',
            });
            const options = {};
            const reqToWorker = (0, http_1.request)(options, (resFromWorker) => {
            });
        });
        balancer.listen(port, () => {
            console.log(`Primary is running at PORT ${port}`);
        });
        for (let i = 0; i < numberCPUs; i += 1) {
            workers[i] = cluster_1.default.fork({ WORKER_PORT: port + i + 1 });
            workers[i].send('hi there');
            workers[i].on('message', (message) => {
                console.log(message);
            });
        }
        cluster_1.default.on('exit', (worker, code) => {
            /*writeFile('src/data.json', "[]", (err: Error) => {
              if (err) throw new Error('Error while writing users');
            });*/
            console.log(`Worker ${worker.id} finished. Exit code: ${code}`);
        });
        cluster_1.default.on('message', (worker, message) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(message);
        }));
        for (const id in cluster_1.default.workers) {
            (_a = cluster_1.default.workers[id]) === null || _a === void 0 ? void 0 : _a.on('message', (message) => {
                console.log(message);
            });
        }
    }
    else if (cluster_1.default.isWorker) {
        port = Number(process.env.WORKER_PORT);
        console.log(`Worker ${(_b = cluster_1.default.worker) === null || _b === void 0 ? void 0 : _b.id} launched at PORT ${port}`);
        server_1.server.listen(port);
        process.on('message', (msg) => {
            if (process.send !== undefined)
                process.send(msg);
        });
    }
}
else {
    server_1.server.listen(port, () => {
        console.log(`Server is running at PORT ${port}`);
    });
}
