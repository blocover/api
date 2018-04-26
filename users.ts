import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { createHash } from 'crypto';
let db = require('./db').db;

export const create: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  let user = JSON.parse(event.body)
  user.password = createHash(user.password);
  // TODO: request user.blockchainPrivateKey from Blockchain 
  user.blockchainPrivateKey = createHash(user.username);

  try {
    let dbuser = await db.set({TableName : process.env.USERS_TABLE, Key: user});
    delete user.password;
    const response = {
      statusCode: 201,
      body: JSON.stringify( { user }),
    };
    cb(null, response);
  } catch (error) {
    console.log(error);
    cb(null, {
      statusCode: 501,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t create user - ask the admin!',
    });
  }
}

export const login: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  console.log(event.body);
  let user = JSON.parse(event.body)

  try {
    let dbuser = await db.get({TableName : process.env.USERS_TABLE, Key: {username: user.username, password: user.password}});
    delete user.password;
    delete dbuser.password;
    const response = {
      statusCode: 201,
      body: JSON.stringify( {
        user: dbuser,
        token: createHash(dbuser.username + dbuser.password).toString(),
      }),
    };
    cb(null, response);
  } catch (error) {
    console.log(error);
      cb(null, {
        statusCode: 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t login! Please check usrname/password.',
      });
  }
};
