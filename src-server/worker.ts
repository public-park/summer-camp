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

import { SocketWorker } from './socket-worker';

// middlewares
import { setHeaders } from './middlewares/setHeaders';
import { rejectIfContentTypeIsNot } from './middlewares/rejectIfContentTypeIsNot';
import { validateAgainst } from './middlewares/validateAgainst';
import allowAccessWith from './middlewares/allowAccessWith';
import { addUserToRequest } from './middlewares/addUserToRequest';
import { verifyJwt } from './middlewares/verifyJwt';
import { handleError } from './middlewares/handleError';
import { setHeaders as setHeadersCallback } from './middlewares/callback/setHeaders';
import { verifyJwtOnUpgrade } from './middlewares/verifyJwtOnUpgrade';
import { verifyUserResourcePolicy } from './middlewares/verifyUserResourcePolicy';
import { verifyAccountResourcePolicy } from './middlewares/verifyAccontResourcePolicy';
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
import { UserPool } from './pool/UserPool';
import { PhoneOutboundController } from './controllers/callback/PhoneOutboundController';
import { PhoneInboundController } from './controllers/callback/PhoneInboundController';
import { StatusEventController } from './controllers/callback/StatusEventController';

/* MongoDB Repository  */
if (!process.env.MONGODB_URI) {
  log.error(`env variable MONGODB_URI is not set, exiting worker ...`);
  process.exit();
}

const mongoOptions = {
  connectTimeoutMS: 5000,
  autoReconnect: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => log.info(`connected to ${process.env.MONGODB_URI} ...`))
  .catch((error) => log.error(error));

export const userRepository = new MongoUserRepository();
export const accountRepository = new MongoAccountRepository();
export const callRepository = new MongoCallRepository();

/* Local File Repository 
export const accountRepository = new FileAccountRepository('./accounts.json');
export const userRepository = new FileUserRepository('./users.json', accountRepository);
export const callRepository = new FileCallRepository('calls.json');
*/

export const authenticationProvider = new PasswordAuthenticationProvider();

export const pool = new UserPool(userRepository);

/* spinning up express */
export const app = express();

app.set('port', process.env.PORT || 5000);

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
callback.route('/accounts/:accountId/phone/outbound').post(PhoneOutboundController.handle);
callback.route('/accounts/:accountId/calls/:callId/status-event/:direction').post(StatusEventController.handle);

app.use('/api/callback', callback);

const user = express.Router();

user.use(express.json());
user.use(verifyJwt);
user.use(addUserToRequest);
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
user.route('/:userId/presence').get(allowAccessWith('user.read'), UserController.getPresence);
user.route('/:userId/configuration').get(allowAccessWith('user.read'), UserController.getConfiguration);
user.route('/:userId/calls').get(allowAccessWith('user.calls.read'), UserController.getCalls);

app.use('/api/users', user);

const account = express.Router();

account.use(express.json());
account.use(verifyJwt);
account.use(addUserToRequest);
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

if (process.env.REGISTRATION_ENABLED === 'true') {
  const registerRouter = express.Router();

  registerRouter.use(express.json());
  registerRouter.use(setHeaders);
  registerRouter.use(rejectIfContentTypeIsNot('application/json'));

  registerRouter.route('/').post(validateAgainst(RegisterRequestSchema), RegisterController.register);

  app.use('/api/register', registerRouter);
}

if (process.env.NODE_ENV === 'production') {
  log.info('running server in production mode');

  app.use(express.static(path.join(__dirname, '../build')));
  app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../build', 'index.html')));
}

app.get('*', function (req, res) {
  res.redirect('/');
});

app.use(handleError);

const server = http.createServer(app);

const options = {
  verifyClient: verifyJwtOnUpgrade,
  clientTracking: true,
  noServer: true,
};

export const socketWorker = new SocketWorker(options, pool);

try {
  socketWorker.run();
} catch (error) {
  log.error(error);
}

server.on('upgrade', (request, socket, head) => {
  socketWorker.server?.handleUpgrade(request, socket, head, function (ws) {
    socketWorker.server?.emit('connection', ws, request);
  });
});

server.listen(app.get('port'), () => {
  log.info(`Listening on ${app.get('port')}`);
});
