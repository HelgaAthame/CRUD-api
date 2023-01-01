"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const fs_1 = require("fs");
const path_1 = require("path");
const chai_1 = __importDefault(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const expect = chai_1.default.expect;
chai_1.default.should();
chai_1.default.use(chai_http_1.default);
const TEST_DATA = [
    { name: 'John', age: 23, hobbies: ['reading', 'swimming', 'basketball'] },
    { name: 'Ann', age: 25, hobbies: ['cooking', 'bicycle'] }
];
let id;
(0, fs_1.writeFileSync)((0, path_1.resolve)('src/data.json'), "[]");
describe('CRUD API', () => {
    before(() => {
        const TEST_DATA = [
            { "name": "John", "age": "23", "hobbies": ["reading", "swimming", "basketball"] },
            { "name": "Ann", "age": "25", "hobbies": ["cooking", "bicycle"] }
        ];
    });
});
describe('CRUD API 1st test scenario', () => {
    //1
    it('should get all users (an empty array is expected)', (done) => {
        chai_1.default
            .request(index_1.server)
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
            .request(index_1.server)
            .post('/api/users')
            .send(TEST_DATA[1])
            .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.should.have.property('name');
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
            .request(index_1.server)
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
            .request(index_1.server)
            .get(`/api/users/${TEST_DATA[1].id}`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.should.have.property('name');
            res.body.should.have.property('age');
            res.body.should.have.property('hobbies');
            res.body.id.should.be.eql(id);
            done();
        });
    });
    //5
    it('should update user by ID (a response is expected containing an updated object with the same id)', (done) => {
        chai_1.default
            .request(index_1.server)
            .put(`/api/users/${TEST_DATA[1].id}`)
            .send({ "name": "Kate", "age": "20", "hobbies": ["music", "swimming", "sleeping"] })
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.should.have.property('name');
            res.body.should.have.property('age');
            res.body.should.have.property('hobbies');
            res.body.id.should.be.eql(id);
            done();
        });
    });
    //6
    it('should get user updated by ID (the updated record is expected)', (done) => {
        chai_1.default
            .request(index_1.server)
            .get(`/api/users/${TEST_DATA[1].id}`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.id.should.be.eql(TEST_DATA[1].id);
            res.body.should.have.property('name');
            res.body.name.should.be.eql("Kate");
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
            .request(index_1.server)
            .delete(`/api/users/${TEST_DATA[1].id}`)
            .end((err, res) => {
            expect(err).to.be.null;
            res.should.have.status(204);
            done();
        });
    });
});
/*describe('CRUD API 2nd test scenario', () => {
  before(()=> {
    writeFileSync(resolve('src/data.json'), "[]");
  })
  // 1
  it('should create new user (a response containing newly created record is expected)', (done) => {
    chai
      .request(server)
      .post('/api/users')
      .send(TEST_DATA[1])
      .end ((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('id');
        res.body.should.have.property('name');
        res.body.should.have.property('age');
        res.body.should.have.property('hobbies');
        id = res.body.id;
        TEST_DATA[1].id = id;
        done()
    })
  })
  //2
  it('should get all users (array with one user expected)', (done) => {
    chai
      .request(server)
      .get('api/users')
      .end ((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(1);

        done()
    })
  })
  //3
  it('should get user by wrong ID (message the id is wrong expected)', (done) => {
    chai
      .request(server)
      .get(`/api/users/dcc846d0-7fe3-11ed-9127-297f0c193a57`)
      .end ((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(404);
        res.body.should.be.a('string');
        res.body.should.be.eql('Record with any userId doesn\'t exist');
        done()
    })
  })
  //получить пользователя по неправильному айди
  //удалить пользователя
  // получить пользователя(его уже нет)
  //попытаться загрузить ресурас по непправильной ссылке
})

//writeFileSync(resolve('src/data.json'), "[]");

/*describe('CRUD API 3rd test scenario', () => {});
  // попытаться добавить пользователся без поля имени
  // создать нового пользователя
  // попытаться получит пользователя с айди который не соответствует uuid
  // попытаться удаліть пользователя с неправільным урлом
  // попытаться удаліть пользователя с не uuid id
  // попытаться удаліть несуществующего пользователя
  // удалить пользователя верно
  // вывести массив пользователей*/
