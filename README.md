## CRUD-api
written with Typescript and Node.js

#### Task
[Assignment: CRUD API](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md)

#### How to download

    git clone git@github.com:HelgaAthame/CRUD-api.git

#### Go to crud-api branch

    git checkout crud-api

#### How to install

    npm i

#### How to run

##### Run application in development mode

    npm run start:dev

##### Run application in production mode

    npm run start:prod

##### Run test scenarios for application

    npm test

##### Run multiple mode using clusters

    npm run start:multi

#### API

Implemented endpoint **<font color="steelblue">api/users</font>**

Get all the users **<font color="steelblue">GET api/users</font>**

Get user by id(uuid) **<font color="steelblue">GET api/users/\${userID}</font>**

Add new user to the in-memory database **<font color="steelblue">POST api/users</font>**

Update existing user information **<font color="steelblue">PUT api/users/\${userID}</font>**

Delete user from the database **<font color="steelblue">DELETE api/users/\${userID}</font>**


#### User mandatory fields

##### username: string,
##### age: number,
##### hobbies: array of strings or an empty array
