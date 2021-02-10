import { FileConnectionSettings } from '../repository/file/FileRepository';
import { FirestoreConnectionSettings } from '../repository/firestore/FirestoreRepository';
import { MongoConnectionSettings } from '../repository/mongo/MongoRepository';

export interface ConnectionSettings {
  type: string;
}

const ConnectionSettings: MongoConnectionSettings = {
  type: 'mongodb',
  uri: process.env.MONGODB_URI as string,
  options: {
    connectTimeoutMS: 5000,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true,
  },
  collections: {
    calls: 'calls',
    accounts: 'accounts',
    users: 'users',
  },
};

/*
const ConnectionSettings: FirestoreConnectionSettings = {
  type: 'firestore',
  options: {
    projectId: '{project-id}',
    keyFilename: './google-firestore-credentials.json',
    ignoreUndefinedProperties: true,
  },
  collections: {
    calls: 'calls',
    accounts: 'accounts',
    users: 'users',
  },
};


const ConnectionSettings: FileConnectionSettings = {
  type: 'file',
  collections: {
    accounts: './accounts.json',
    users: './users.json',
    calls: './calls.json',
  },
};
*/

export default ConnectionSettings;
