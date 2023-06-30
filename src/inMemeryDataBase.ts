import { User } from "./userInterface";
import { createServer } from 'http';
import * as url from 'url';

export interface Database {
  getAllUsers: () => User[];
  getUserById (id: string): User;
  createUser (user: User): User;
  updateUser (user: Partial<User>, id: string): User | undefined;
  deleteUserById (id: string): void;
}

class DataBase {
  users: User[];

  constructor() {
    this.users = [];
  }
  setAllUsers (users: User[]) {
    this.users = users;
  }
  getAllUsers () {
    return this.users;
  }
  getUserById (id: string) {
    if (id.startsWith('\"') && id.endsWith('\"')) id = id.slice(1,-1);
    const user: User[] = this.users.filter((user) => user.id === id || user.id == `\"${id}\"`);
    return user[0] ?? null;
  }
  createUser (user: User) {
    this.users.push(user);
    return this.getUserById(user.id);
  }
  updateUser (user: Partial<User>, id: string) {
    if (id.startsWith('\"') && id.endsWith('\"')) id = id.slice(1,-1);
    const ourUser = this.users.find((user) => user.id === id);
    if (ourUser) {
      if (user.age) ourUser.age = user.age;
      if (user.username) ourUser.username = user.username;
      if (user.hobbies) ourUser.hobbies = user.hobbies;
    }
    return ourUser;
  }
  deleteUserById (id: string) {
    if (id.startsWith('\"') && id.endsWith('\"')) id = id.slice(1,-1);
    for (let i = 0; i < this.users.length; i += 1) {
      if (this.users[i].id === id) {
        this.users.splice(i, 1);
      }
    }
    return;
  }
}



export const database = new DataBase;

export const dataBase = createServer((req, res) => {
  switch(req.method) {
    case 'GET':
      const users = database.getAllUsers();
      res.end(JSON.stringify(users));
      break;

    case 'POST':
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', () => {
        database.setAllUsers(JSON.parse(data));
      });
      res.end();
      break;

    default:
      res.end(null);
  }
})
