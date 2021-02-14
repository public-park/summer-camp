import { UserPoolManager } from '../../../pool/UserPoolManager';
import { PhoneConfigurationDocument } from '../../documents/PhoneConfigurationDocument';
import { UserPresenceDocument } from '../../documents/UserDocument';
import { UserWithSocket } from '../../UserWithSocket';
import { Message, MessageType } from './Message';

export class ConnectMessage extends Message {
  payload: {
    user: UserPresenceDocument | undefined;
    phone: PhoneConfigurationDocument | undefined;
    list: Array<UserPresenceDocument>;
  };

  constructor() {
    super(MessageType.Connect);

    this.payload = {
      user: undefined,
      phone: undefined,
      list: [],
    };
  }

  async build(pool: UserPoolManager, user: UserWithSocket) {
    this.payload = {
      user: user.toPresenceDocument(),
      phone: user.getPhoneConfiguration(user.account),
      list: (await pool.getAllWithFallback(user.account)).map((user) => user.toPresenceDocument()),
    };

    return this;
  }
}
