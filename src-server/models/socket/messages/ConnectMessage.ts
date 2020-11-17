import { UserPoolManager } from '../../../pool/UserPoolManager';
import { UserWithPresenceDocument } from '../../documents/UserDocument';
import { UserConfiguration } from '../../UserConfiguration';
import { UserWithSocket } from '../../UserWithSocket';
import { Message, MessageType } from './Message';

export class ConnectMessage extends Message {
  payload: {
    user: UserWithPresenceDocument;
    configuration: UserConfiguration | undefined;
    list: Array<UserWithPresenceDocument>;
  };

  constructor(pool: UserPoolManager, user: UserWithSocket, messageId?: string) {
    super(MessageType.Connect, messageId);

    this.payload = {
      user: user.toUserWithPresenceDocument(),
      configuration: user.getConfiguration(user.account),
      list: pool.getAll(user.account).map((user) => user.toUserWithPresenceDocument()),
    };
  }
}
