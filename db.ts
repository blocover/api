import { DynamoDB } from 'aws-sdk';

console.log(process.env);

let dynamoConfig = {
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: process.env.SERVERLESS_REGION
};

if (process.env.IS_OFFLINE) {
  dynamoConfig['endpoint'] = 'http://localhost:8000/';
  dynamoConfig['region'] = 'eu-central-1';
  dynamoConfig['sessionToken'] = 'BLaaaaaa';
}

let db = new DynamoDB.DocumentClient(dynamoConfig);
export { db };
