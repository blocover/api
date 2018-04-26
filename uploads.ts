import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as uuid from 'uuid';
let db = require('./db').db;

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
    let upload = await db.put(params);

    const response = {
      statusCode: 201,
      body: JSON.stringify(params.Item),
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

export const list: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  let uploads = [];
  // TODO: get from db
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      uploads
    }),
  };

  cb(null, response);
}

export const get: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  console.log(event);

  // TODO: get from db
  let upload = {'id': '12345'};

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      upload
    }),
  };

  cb(null, response);
}