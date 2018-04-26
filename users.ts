import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';

export const create: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  let user = JSON.parse(event.body)

  // TODO: encrypt password, store in database
  delete user.password;

  const response = {
    statusCode: 201,
    body: JSON.stringify({
      user
    }),
  };

  cb(null, response);
}

export const login: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  let user = JSON.parse(event.body)

  // TODO: create token in DB and return token

  let token = { token: "f;lihjsg;kljadfhkl;sn;lk" }

  const response = {
    statusCode: 201,
    body: JSON.stringify({
      token
    }),
  };

  cb(null, response);
}
