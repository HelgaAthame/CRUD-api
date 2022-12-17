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
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const url = __importStar(require("url"));
const parseArgs_1 = require("./parseArgs");
let uuid = require('node-uuid');
const host = 'localhost';
const port = process.env.PORT || 4000;
const args = (0, parseArgs_1.parseArgs)();
const endPoint = '/api/users';
let users = [];
const idRegEx = /[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
const server = (0, http_1.createServer)((req, res) => {
    var _a, _b, _c, _d, _e, _f;
    try {
        const myUrl = url.parse(req.url, true);
        if (!((_a = myUrl === null || myUrl === void 0 ? void 0 : myUrl.path) === null || _a === void 0 ? void 0 : _a.startsWith(endPoint))) {
            res.statusCode = 404;
            res.end(`Requested resource doesn\'t exist`);
        }
        else if (req.method === 'GET') {
            if (myUrl.path === endPoint) {
                res.statusCode = 200;
                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(users));
            }
            else if ((_b = myUrl.path) === null || _b === void 0 ? void 0 : _b.startsWith(`${endPoint}/`)) {
                const findUserId = (_c = myUrl.path) === null || _c === void 0 ? void 0 : _c.match(idRegEx);
                if (findUserId == null) {
                    res.statusCode = 400;
                    res.end('User ID is invalid (not uuid)');
                }
                else {
                    const strFindId = JSON.stringify(findUserId[0]);
                    if (users.length === 0) {
                        res.statusCode = 404;
                        res.end('Record with any userId doesn\'t exist');
                    }
                    else {
                        users.forEach((user, i) => {
                            const strUserId = JSON.stringify(user.id);
                            if (strFindId === strUserId) {
                                res.statusCode = 200;
                                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify(user));
                            }
                            else {
                                if (i === users.length - 1 && strFindId !== strUserId) {
                                    res.statusCode = 404;
                                    res.end('Record with this userId doesn\'t exist');
                                }
                            }
                        });
                    }
                }
            }
            else if (!((_d = myUrl.path) === null || _d === void 0 ? void 0 : _d.startsWith(`${endPoint}/`))) {
                res.statusCode = 404;
                res.end(`Requested resource doesn\'t exist. please correct url.`);
            }
        }
        else if (req.method === 'POST') {
            let data = '';
            req.on('data', chunk => {
                data += chunk;
            });
            req.on('end', () => {
                try {
                    const newUser = JSON.parse(data);
                    if (!newUser.name || !newUser.age || !newUser.hobbies) {
                        res.statusCode = 400;
                        res.end('Request body does not contain required fields');
                    }
                    else {
                        if (myUrl.path === endPoint || myUrl.path === `${endPoint}/`) {
                            newUser.id = uuid.v1();
                            users.push(newUser);
                            res.statusCode = 201;
                            res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(users[users.length - 1]));
                        }
                        else {
                            res.statusCode = 400;
                            res.end('URL is invalid');
                        }
                    }
                }
                catch (e) {
                    res.statusCode = 500;
                    res.end(`Sorry... Errors on the server side occur during the processing of your request. \n Please, try again`);
                }
            });
        }
        else if (req.method === 'PUT') {
            //
            let data = '';
            req.on('data', chunk => {
                data += chunk;
            });
            req.on('end', () => {
                var _a, _b;
                try {
                    const newUser = JSON.parse(data);
                    if (!newUser.name || !newUser.age || !newUser.hobbies) {
                        res.statusCode = 400;
                        res.end('Request body does not contain required fields');
                    }
                    else {
                        if ((_a = myUrl.path) === null || _a === void 0 ? void 0 : _a.startsWith(`${endPoint}/`)) {
                            const findUserId = (_b = myUrl.path) === null || _b === void 0 ? void 0 : _b.match(idRegEx);
                            if (findUserId == null) {
                                res.statusCode = 400;
                                res.end('User ID is invalid (not uuid)');
                            }
                            else {
                                const strFindId = JSON.stringify(findUserId[0]);
                                if (users.length === 0) {
                                    res.statusCode = 404;
                                    res.end('Record with any userId doesn\'t exist');
                                }
                                for (let i = 0; i < users.length; i += 1) {
                                    const strUserId = JSON.stringify(users[i].id);
                                    if (strFindId == strUserId) {
                                        users[i] = {
                                            id: users[i].id,
                                            name: newUser.name,
                                            age: newUser.age,
                                            hobbies: newUser.hobbies
                                        };
                                        res.statusCode = 200;
                                        res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                                        res.end(JSON.stringify(users[i]));
                                    }
                                    else {
                                        if (i === users.length - 1 && strFindId !== strUserId) {
                                            res.statusCode = 404;
                                            res.end('Record with this userId doesn\'t exist');
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            res.statusCode = 400;
                            res.end('URL is invalid');
                        }
                    }
                }
                catch (e) {
                    res.statusCode = 500;
                    res.end(`Sorry... Errors on the server side occur during the processing of your request. \n Please, try again`);
                }
            });
            //
        }
        else if (req.method === 'DELETE' && ((_e = req.url) === null || _e === void 0 ? void 0 : _e.startsWith(endPoint))) {
            if (myUrl.path === endPoint || myUrl.path === `${endPoint}/`) {
                res.statusCode = 400;
                res.end('URL is invalid');
            }
            else {
                const findUserId = (_f = myUrl.path) === null || _f === void 0 ? void 0 : _f.match(idRegEx);
                if (findUserId == null) {
                    res.statusCode = 400;
                    res.end('User ID is invalid (not uuid)');
                }
                else {
                    const strFindId = JSON.stringify(findUserId[0]);
                    if (users.length === 0) {
                        res.statusCode = 404;
                        res.end('Record with any userId doesn\'t exist');
                    }
                    else {
                        for (let i = 0; i < users.length; i += 1) {
                            const strUserId = JSON.stringify(users[i].id);
                            if (strFindId == strUserId) {
                                users.splice(i, 1);
                                res.statusCode = 204;
                                res.end('Record was deleted');
                            }
                            else {
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
    }
    catch (e) {
        res.statusCode = 500;
        res.end(`Sorry... Errors on the server side that occur during the processing of your request. \n Please, try again`);
    }
});
server.listen(port);
