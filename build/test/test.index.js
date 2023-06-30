"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../src/server");
const chai_1 = __importDefault(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const inMemeryDataBase_1 = require("../src/inMemeryDataBase");
const expect = chai_1.default.expect;
chai_1.default.should();
chai_1.default.use(chai_http_1.default);
inMemeryDataBase_1.dataBase.listen(3000);
const TEST_DATA = [
    { username: 'John', age: 23, hobbies: ['reading', 'swimming', 'basketball'] },
    { username: 'Ann', age: 25, hobbies: ['cooking', 'bicycle'] }
];
let id;
describe('CRUD API 1st test scenario', () => {
    //1
    it('should get all users (an empty array is expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .get('/api/users')
            .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(0);
            done();
        });
    });
    //2
    it('should create new user (a response containing newly created record is expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .post('/api/users')
            .send(TEST_DATA[1])
            .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.should.have.property('username');
            res.body.should.have.property('age');
            res.body.should.have.property('hobbies');
            id = res.body.id;
            TEST_DATA[1].id = id;
            done();
        });
    });
    //3
    it('should get all users (array with one user expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .get('/api/users')
            .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(1);
            done();
        });
    });
    //4
    it('should get user by ID (the created record is expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .get(`/api/users/${TEST_DATA[1].id}`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.should.have.property('username');
            res.body.should.have.property('age');
            res.body.should.have.property('hobbies');
            res.body.id.should.be.eql(id);
            done();
        });
    });
    //5
    it('should update user by ID (a response is expected containing an updated object with the same id)', (done) => {
        chai_1.default
            .request(server_1.server)
            .put(`/api/users/${TEST_DATA[1].id}`)
            .send({ "username": "Kate", "age": "20", "hobbies": ["music", "swimming", "sleeping"] })
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.should.have.property('username');
            res.body.should.have.property('age');
            res.body.should.have.property('hobbies');
            res.body.id.should.be.eql(id);
            done();
        });
    });
    //6
    it('should get user updated by ID (the updated record is expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .get(`/api/users/${TEST_DATA[1].id}`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.id.should.be.eql(TEST_DATA[1].id);
            res.body.should.have.property('username');
            res.body.username.should.be.eql("Kate");
            res.body.should.have.property('age');
            res.body.age.should.be.eql("20");
            res.body.should.have.property('hobbies');
            res.body.hobbies.should.be.eql(["music", "swimming", "sleeping"]);
            res.body.id.should.be.eql(id);
            done();
        });
    });
    //7
    it('should delete user by ID (confirmation of successful deletion is expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .delete(`/api/users/${TEST_DATA[1].id}`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(204);
            done();
        });
    });
});
describe('CRUD API 2nd test scenario', () => {
    // 1
    it('should create new user (a response containing newly created record is expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .post('/api/users')
            .send(TEST_DATA[1])
            .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.should.have.property('username');
            res.body.should.have.property('age');
            res.body.should.have.property('hobbies');
            id = res.body.id;
            TEST_DATA[1].id = id;
            done();
        });
    });
    //2
    it('should get all users (array with one user expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .get('/api/users')
            .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(1);
            done();
        });
    });
    //3
    it('should get user by wrong ID (message the id is wrong expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .get(`/api/users/dcc846d0-7fe3-11ed-9127-297f0c193a57`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(404);
            res.body.should.be.a('object');
            done();
        });
    });
    //4
    it('should get user by wrong not uuid ID (message the id is not uuid expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .get(`/api/users/dcc846d0`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(400);
            res.body.should.be.a('object');
            done();
        });
    });
    //5
    it('should delete user by ID (confirmation of successful deletion is expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .delete(`/api/users/${TEST_DATA[1].id}`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(204);
            done();
        });
    });
    //6
    it('should load app with wrong url (message the url is wrong expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .get(`/qqqqqqqqqqqqq`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(404);
            res.body.should.be.a('object');
            done();
        });
    });
});
describe('CRUD API 3rd test scenario', () => {
    //1
    it('try create new user without username field (a response containing newly created record is expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .post('/api/users')
            .send({ "age": "20", "hobbies": ["football", "reading", "watchingTV"] })
            .end((err, res) => {
            res.should.have.status(400);
            done();
        });
    });
    //2
    it('should create new user (a response containing newly created record is expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .post('/api/users')
            .send(TEST_DATA[0])
            .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.should.have.property('username');
            res.body.should.have.property('age');
            res.body.should.have.property('hobbies');
            id = res.body.id;
            TEST_DATA[0].id = id;
            done();
        });
    });
    //3
    it('try get user by wrong not uuid ID (message the id is not uuid expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .get(`/api/users/qqqqqqqqqqq`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(400);
            res.body.should.be.a('object');
            done();
        });
    });
    //4
    it('try delete user by wrong url (message the url is wrong expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .delete(`/qqqqq/users/${TEST_DATA[1].id}`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(404);
            done();
        });
    });
    //
    it('try delete user by wrong not uuid ID (message the id is not uuid expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .delete(`/api/users/qqqqqqqqqqq`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(400);
            res.body.should.be.a('object');
            done();
        });
    });
    //6
    it('try to delete non-existing user by ID (message the doesn\'t exist)', (done) => {
        chai_1.default
            .request(server_1.server)
            .delete(`/api/users/91c203c0-89c4-11ed-8504-9f0789a71bc5`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(404);
            res.body.should.be.a('object');
            done();
        });
    });
    //7
    it('should delete user by ID (confirmation of successful deletion is expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .delete(`/api/users/${TEST_DATA[0].id}`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(204);
            done();
        });
    });
    //8
    it('should get all users (an empty array is expected)', (done) => {
        chai_1.default
            .request(server_1.server)
            .get('/api/users')
            .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(0);
            done();
        });
    });
});
