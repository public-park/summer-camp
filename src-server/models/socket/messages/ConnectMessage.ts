import { UserPoolManager } from '../../../pool/UserPoolManager';
import { PhoneConfigurationDocument } from '../../documents/PhoneConfigurationDocument';
import { UserPresenceDocument } from '../../documents/UserDocument';
import { User } from '../../User';
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

  async build(pool: UserPoolManager, user: User) {
    this.payload = {
      user: user.toPresenceDocument(),
      phone: await user.getPhoneConfiguration(),
      list: (await pool.getAllWithFallback(await user.getAccount())).map((user) => user.toPresenceDocument()),
    };

    return this;
  }
}
