import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as uuid from 'uuid';
import * as JWT from 'jsonwebtoken';
import { Upload, User } from './db';
import { DynamoDBStreams } from 'aws-sdk';

export const create: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  let uploadInput = JSON.parse(event.body);

  // write the upload to the database
  try {
    let authHeader = event.headers['Authorization'].replace('Bearer ', '');
    let authToken = JWT.verify(authHeader.replace('Bearer ', ''), 'super_secret');

    let uploadToCreate = {
      owner: authToken.id,
      title: uploadInput.title,
      genre: uploadInput.genre,
      hash: uploadInput.hash,
      cover: uploadInput.cover
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
    let uploads = dbCall.Items.map(async item => {
      var upload = item.get();
      let dbCall = await User.scan().where('id').gte(upload.owner).execAsync();
      upload.artist = dbCall.Items[0].get();
      delete upload.owner;
      return upload;
    });

    await Promise.all(uploads)
      .then((completed) => {
        const response = {
          statusCode: 200,
          body: JSON.stringify(completed),
        };

        cb(null, response);
    });
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
