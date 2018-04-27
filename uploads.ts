import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as uuid from 'uuid';
import * as JWT from 'jsonwebtoken';
import { Upload } from './db';
import { DynamoDBStreams } from 'aws-sdk';

export const create: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  let uploadInput = JSON.parse(event.body);

  const timestamp = new Date().getTime();
  let params = {
    TableName: process.env.UPLOADS_TABLE,
    Item: {
      id: uuid.v1(),
      title: uploadInput.title,
      genre: uploadInput.genre,
      hash: uploadInput.hash,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  // write the upload to the database
  try {
    let authHeader = event.headers['Authorization'].replace('Bearer ', '');
    let authToken = JWT.verify(authHeader.replace('Bearer ', ''), 'super_secret');
    
    let uploadToCreate = {
      owner: authToken.id,
      title: uploadInput.title,
      genre: uploadInput.genre,
      hash: uploadInput.hash,
    }

    let dbCall = await Upload.createAsync(uploadToCreate);
    let upload = dbCall.get();

    const response = {
      statusCode: 201,
      body: JSON.stringify(upload),
    };

    cb(null, response);
  } catch (error) {
    console.log(error);
    cb(null, {
      statusCode: 501,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t create the todo item.',
    });
  }
}

export const list: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  try {
    let dbCall = await Upload.scan().loadAll().execAsync();
    let uploads = dbCall.Items.map((item) => item.get());
    console.log(uploads);
    
    const response = {
      statusCode: 200,
      body: JSON.stringify(uploads),
    };

    cb(null, response);
  } catch(error) {
    console.log(error);
    cb(null, {
      statusCode: 501,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Something went wrong',
    });
  }
}

export const get: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  try {
    let dbCall = await Upload.query(event.pathParameters.id).execAsync();
    let item = dbCall.Items[0];
    if (item) {
      //1a12d46e-4f53-4316-af2c-953236a83d62
      let upload = item.get();
      const response = {
        statusCode: 200,
        body: JSON.stringify(upload),
      };
      cb(null, response);
    } else {
      // 404
      cb(null, {
        statusCode: 404,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Not Found',
      });
    }
  } catch(error) {
    console.log(error);
    cb(null, {
      statusCode: 501,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Something went wrong',
    });
  }
}
