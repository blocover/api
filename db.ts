import { DynamoDB } from 'aws-sdk';
import * as dynogels from 'dynogels-promisified';
import * as Joi from 'joi';

//console.log(process.env);

let dynamoConfig = {
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: process.env.SERVERLESS_REGION
};

if (process.env.IS_OFFLINE) {
  dynamoConfig['endpoint'] = 'http://localhost:8000/';
  dynamoConfig['region'] = 'eu-central-1';
  dynamoConfig['sessionToken'] = 'BLaaaaaa';
}

dynogels.AWS.config.update(dynamoConfig);

let User = dynogels.define('User', {
  tableName: process.env.USERS_TABLE,
  hashKey: 'email',
  timestamps : true,
  schema : {
    id: dynogels.types.uuid(),
    name: Joi.string(),
    email: Joi.string(),
    password: Joi.string(),
  },
});

let Upload = dynogels.define('Upload', {
  tableName: process.env.UPLOADS_TABLE,
  hashKey: 'id',
  timestamps : true,
  schema : {
    id: dynogels.types.uuid(),
    owner: Joi.string(),
    title: Joi.string(),
    genre: Joi.string(),
    hash: Joi.string(),
  },
});

export { dynamoConfig, User, Upload };
