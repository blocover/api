import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as bcrypt from 'bcryptjs';
import { User } from './db';
import * as JWT from 'jsonwebtoken';
import * as dynogels from 'dynogels-promisified';
import { registerUser } from './blockchain';

export const create: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  let user = JSON.parse(event.body)
  
  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(user.password, salt);

  // TODO: request user.blockchainPrivateKey from Blockchain
  // user.blockchainPrivateKey = createHash(user.username);

  try {
    let dbCall = await User.createAsync(user);
    let dbUser = dbCall.get();

    delete dbUser.password;

    let blockchainUser = await registerUser({ id: dbUser.id, artistName: user.name });
    console.log(blockchainUser);

    dbUser.blockchainAddress = blockchainUser.type;
    let updateCall = await User.updateAsync(dbUser);
    let updatedDBUser = updateCall.get()

    cb(null, { statusCode: 201, body: JSON.stringify(updatedDBUser) });
  } catch (error) {
    console.log(error);
    cb(null, JSON.stringify({
      statusCode: 501,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t create user - ask the admin!',
    }));
  }
}

export const login: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  let user = JSON.parse(event.body)

  try {
    let dbCall = await User.getAsync(user.email);
    let dbUser = dbCall.get();

    if (!dbUser || bcrypt.compareSync(user.password, dbUser.password) == false) {
      const response = {
        statusCode: 401,
        body: JSON.stringify( {
          error: "Unauthorized"
        }),
      };
      cb(null, response);
      return;
    }

    const tokenPayload = {
      id: dbUser.id,
      email: dbUser.email
    };

    cb(null, { statusCode: 201, body: JSON.stringify({ token: `Bearer ${signUser(tokenPayload)}` })} );
  } catch (error) {
    console.log(error);
    cb(null, JSON.stringify({ statusCode: 500, body: "Something went wrong" }));
  }
};

function signUser(user) {
  const token = JWT.sign(user, 'super_secret', { expiresIn: '28d' });
  return token;
}
