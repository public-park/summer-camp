import * as dotenv from 'dotenv';
import { log } from './logger';

dotenv.config();

if (!process.env.SESSION_SECRET) {
  log.error(`env variable SESSION_SECRET is not set, exiting worker ...`);
  process.exit();
}

import * as express from 'express';
import * as http from 'http';
import * as cors from 'cors';
import * as path from 'path';

import { SocketWorker, SocketWorkerOptions } from './socket-worker';

// middlewares
import { setHeaders } from './middlewares/setHeaders';
import { rejectIfContentTypeIsNot } from './middlewares/rejectIfContentTypeIsNot';
import { validateAgainst } from './middlewares/validateAgainst';
import allowAccessWith from './middlewares/allowAccessWith';
import { verifyJwt } from './middlewares/verifyJwt';
import { handleError } from './middlewares/handleError';
import { setHeaders as setHeadersCallback } from './middlewares/callback/setHeaders';
import { verifyJwtOnUpgrade } from './middlewares/verifyJwtOnUpgrade';
import { verifyUserResourcePolicy } from './middlewares/verifyUserResourcePolicy';
import { verifyAccountResourcePolicy } from './middlewares/verifyAccountResourcePolicy';
import { addAccountToRequest } from './middlewares/callback/addAccountToRequest';

// middlewares - schema validation
import { RegisterRequestSchema } from './middlewares/schema-validation/RegisterRequestSchema';
import { LoginRequestSchema } from './middlewares/schema-validation/LoginRequestSchema';
import { AccountConfigurationRequestSchema } from './middlewares/schema-validation/AccountConfigurationRequestSchema';
import { UserCreateRequestSchema } from './middlewares/schema-validation/UserCreateRequestSchema';
import { UserUpdateRequestSchema } from './middlewares/schema-validation/UserUpdateRequestSchema';
import { ValidateTokenRequestSchema } from './middlewares/schema-validation/ValidateTokenRequestSchema';

// controllers
import { ConfigurationController } from './controllers/ConfigurationController';
import { ConfigurationPhoneNumberController } from './controllers/ConfigurationPhoneNumberController';
import { LoginController } from './controllers/LoginController';
import { RegisterController } from './controllers/RegisterController';
import { AccountController } from './controllers/AccountController';
import { UserController } from './controllers/UserController';
import { PhoneController } from './controllers/PhoneController';
import { ValidateTokenController } from './controllers/ValidateTokenController';

import { PasswordAuthenticationProvider } from './security/authentication/PasswordAuthenticationProvider';

import { FileUserRepository } from './repository/file/FileUserRepository';
import { FileAccountRepository } from './repository/file/FileAccountRepository';

import { MongoUserRepository } from './repository/mongo/MongoUserRepository';
import { MongoAccountRepository } from './repository/mongo/MongoAccountRepository';
import { MongoCallRepository } from './repository/mongo/MongoCallRepository';
import * as mongoose from 'mongoose';
import { UserPoolManager } from './pool/UserPoolManager';
import { PhoneInboundController } from './controllers/callback/PhoneInboundController';
import { CallStatusEventController } from './controllers/callback/CallStatusEventController';
import { SamlAuthenticationController } from './controllers/SamlAuthenticationController';
import * as passport from 'passport';

import { getStrategy } from './helpers/SamlPassportHelper';
import { ConferenceStatusEventController } from './controllers/callback/ConferenceStatusEventController';
import { verifyCallResourcePolicy } from './middlewares/verifyCallResourcePolicy';
import { CallController } from './controllers/CallController';
import { addCallToRequest } from './middlewares/callback/addCallToRequest';
import { FileCallRepository } from './repository/file/FileCallRepository';
import { UserPresenceController } from './controllers/UserPresenceController';
import { addJwt } from './middlewares/addJwt';
import { Request, Response } from 'express';
import { ShopifyAuthenticationController } from './controllers/ShopifyAuthenticationController';

/* SAML 2.0 Metadata */
if (process.env.REACT_APP_AUTHENTICATION_MODE === 'saml') {
  try {
    if (!process.env.SAML_AUTHENTICATION_METADATA) {
      throw `env parameter SAML_AUTHENTICATION_METADATA is missing`;
    }

    const file = path.join(process.cwd(), process.env.SAML_AUTHENTICATION_METADATA);

    passport.use('saml', getStrategy(file));
  } catch (error) {
    log.error(error);
    process.exit();
  }
}

/* MongoDB Repository */
if (!process.env.MONGODB_URI) {
  log.error(`env variable MONGODB_URI is not set, exiting worker ...`);
  process.exit();
}

const mongoOptions = {
  connectTimeoutMS: 5000,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useCreateIndex: true,
};

mongoose
  .connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => log.info(`connected to ${process.env.MONGODB_URI} ...`))
  .catch((error) => log.error(error));

export const accountRepository = new MongoAccountRepository('accounts');
export const userRepository = new MongoUserRepository('users');
export const callRepository = new MongoCallRepository('calls');

/* Google Firestore 
const firestore = new Firestore({
  projectId: '{project-id}',
  keyFilename: './google-firestore-credentials.json',
  ignoreUndefinedProperties: true,
});

export const accountRepository = new FirestoreAccountRepository(firestore, 'accounts');
export const userRepository = new FirestoreUserRepository(firestore, 'users');
export const callRepository = new FirestoreCallRepository(firestore, 'calls');
*/

/* Local File Repository 
export const accountRepository = new FileAccountRepository('./accounts.json');
export const userRepository = new FileUserRepository('./users.json');
export const callRepository = new FileCallRepository('calls.json');
*/
export const authenticationProvider = new PasswordAuthenticationProvider();

export const pool = new UserPoolManager(accountRepository, userRepository, callRepository);

/* spinning up express */
export const app = express();

app.set('port', process.env.PORT || 5000);
app.set('etag', false);

app.enable('trust proxy');
app.disable('x-powered-by');

let corsOptions: cors.CorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
};

/* enable CORS in production mode */
if (process.env.NODE_ENV === 'production') {
  corsOptions.origin = false;
}

app.use(cors(corsOptions));

const callback = express.Router();

callback.use(express.urlencoded({ extended: true }));
callback.use(setHeadersCallback);
callback.param('accountId', addAccountToRequest);

callback.route('/accounts/:accountId/phone/inbound').post(PhoneInboundController.handleConnectToUser);
callback.route('/accounts/:accountId/phone/inbound/completed').post(PhoneInboundController.handleCompleted);

app.use('/api/callback', callback);

const statusCallback = express.Router();

statusCallback.use(express.urlencoded({ extended: true }));
statusCallback.use(setHeadersCallback);
statusCallback.param('accountId', addAccountToRequest);
statusCallback.param('callId', addCallToRequest);

statusCallback.route('/accounts/:accountId/calls/:callId/status').post(CallStatusEventController.handle);

statusCallback
  .route('/accounts/:accountId/calls/:callId/conference/inbound')
  .post(ConferenceStatusEventController.handleInbound);
statusCallback
  .route('/accounts/:accountId/calls/:callId/conference/outbound')
  .post(ConferenceStatusEventController.handleOutbound);

app.use('/api/status-callback', statusCallback);

const user = express.Router();

user.use(express.json());
user.use(verifyJwt);
user.use(addJwt);
user.use(setHeaders);

user.param('userId', verifyUserResourcePolicy);

user
  .route('/')
  .post(
    rejectIfContentTypeIsNot('application/json'),
    allowAccessWith('user.create'),
    validateAgainst(UserCreateRequestSchema),
    UserController.create
  );

user.route('/:userId').get(allowAccessWith('user.read'), UserController.fetch);
user
  .route('/:userId')
  .post(
    rejectIfContentTypeIsNot('application/json'),
    allowAccessWith('user.update'),
    validateAgainst(UserUpdateRequestSchema),
    UserController.update
  );

user.route('/:userId').delete(allowAccessWith('user.delete'), UserController.remove);
user.route('/:userId/phone/token').post(allowAccessWith('user.phone.create'), PhoneController.createToken);
user.route('/:userId/presence').get(allowAccessWith('user.read'), UserPresenceController.get);

app.use('/api/users', user);

const account = express.Router();

account.use(express.json());
account.use(verifyJwt);
account.use(addJwt);
account.use(setHeaders);

account.param('accountId', verifyAccountResourcePolicy);

account
  .route('/:accountId/configuration')
  .post(
    rejectIfContentTypeIsNot('application/json'),
    allowAccessWith('account.configuration.update'),
    validateAgainst(AccountConfigurationRequestSchema),
    ConfigurationController.update
  );
account
  .route('/:accountId/configuration')
  .get(allowAccessWith('account.configuration.read'), ConfigurationController.fetch);
account
  .route('/:accountId/configuration/validate')
  .post(
    rejectIfContentTypeIsNot('application/json'),
    allowAccessWith('account.configuration.update'),
    validateAgainst(AccountConfigurationRequestSchema),
    ConfigurationController.validate
  );
account
  .route('/:accountId/phone-numbers')
  .get(allowAccessWith('account.configuration.read'), ConfigurationPhoneNumberController.fetch);

account.route('/:accountId').get(allowAccessWith('account.read'), AccountController.fetch);

app.use('/api/accounts', account);

const call = express.Router();

call.use(express.json());
call.use(verifyJwt);
call.use(addJwt);
call.use(setHeaders);

call.param('callId', verifyCallResourcePolicy);

call.route('/').get(allowAccessWith('call.read'), CallController.getAll);
call.route('/:callId').get(allowAccessWith('call.read'), CallController.fetch);

app.use('/api/calls', call);

const loginRouter = express.Router();

loginRouter.use(express.json());
loginRouter.use(rejectIfContentTypeIsNot('application/json'));
loginRouter.use(setHeaders);

loginRouter.route('/').post(validateAgainst(LoginRequestSchema), LoginController.login);

app.use('/api/login', loginRouter);

const validateTokenRouter = express.Router();

validateTokenRouter.use(express.json());
validateTokenRouter.use(rejectIfContentTypeIsNot('application/json'));
validateTokenRouter.use(setHeaders);

validateTokenRouter.route('/').post(validateAgainst(ValidateTokenRequestSchema), ValidateTokenController.validate);

app.use('/api/validate-token', validateTokenRouter);

/* SAML 2.0
const samlRouter = express.Router();

samlRouter.use(express.urlencoded({ extended: true }));
samlRouter.param('accountId', addAccountToRequest);

samlRouter.route('/:accountId/authenticate').all(
  passport.authenticate('saml', {
    session: false,
  }),
  SamlAuthenticationController.authenticate
);

app.use('/saml', samlRouter);
 */

if (process.env.REACT_APP_AUTHENTICATION_MODE === 'local-password-with-registration') {
  const registerRouter = express.Router();

  registerRouter.use(express.json());
  registerRouter.use(setHeaders);
  registerRouter.use(rejectIfContentTypeIsNot('application/json'));

  registerRouter.route('/').post(validateAgainst(RegisterRequestSchema), RegisterController.register);

  app.use('/api/register', registerRouter);
}

/* return 404 for all other /api routes */
app.all('/api/*', function (req, res) {
  res.status(404).end();
});

if (process.env.NODE_ENV === 'production') {
  log.info('running server in production mode');

  /* redirect insecure requests
  app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
    if (request.secure) {
      return next();
    }
    response.redirect('http://' + request.headers.host + request.url);
  }); */

  app.use(
    express.static(path.join(__dirname, '../build'), {
      etag: false,
      lastModified: false,
    })
  );

  app.get('/', (request: express.Request, response: express.Response) =>
    response.sendFile(path.join(__dirname, '../build', 'index.html'))
  );

  app.get('*', function (req, res) {
    res.redirect('/');
  });
}

app.use(handleError);

const server = http.createServer(app);

const options: SocketWorkerOptions = {
  keepAliveInSeconds: 30,
  server: {
    verifyClient: verifyJwtOnUpgrade,
    clientTracking: true,
    noServer: true,
    path: '/socket',
  },
};

export const socketWorker = new SocketWorker(options, pool);

try {
  socketWorker.run();
} catch (error) {
  log.error(error);
}

server.on('upgrade', (request, socket, head) => {
  if (!socketWorker.server) {
    log.error('SocketWorker: Server is undefined, cannot handle upgrade');
    return;
  }

  socketWorker.server.handleUpgrade(request, socket, head, (ws) => {
    socketWorker.server?.emit('connection', ws, request);
  });
});

server.listen(app.get('port'), 'localhost', () => {
  log.info(`Listening on ${app.get('port')}`);
});
