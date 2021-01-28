import { UserPoolManager } from '../../../pool/UserPoolManager';
import { PhoneConfigurationDocument } from '../../documents/PhoneConfigurationDocument';
import { UserPresenceDocument } from '../../documents/UserDocument';
import { UserWithSocket } from '../../UserWithSocket';
import { Message, MessageType } from './Message';

export class ConnectMessage extends Message {
  payload: {
    user: UserPresenceDocument;
    phone: PhoneConfigurationDocument;
    list: Array<UserPresenceDocument>;
  };

  constructor(pool: UserPoolManager, user: UserWithSocket, messageId?: string) {
    super(MessageType.Connect, messageId);

    this.payload = {
      user: user.toPresenceDocument(),
      phone: user.getPhoneConfiguration(user.account),
      list: pool.getAll(user.account).map((user) => user.toPresenceDocument()),
    };
  }
}
