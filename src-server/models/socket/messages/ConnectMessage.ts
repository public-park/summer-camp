import { UserConfiguration, UserWithOnlineStateResponse } from '../../User';
import { Message, MessageType } from './Message';

export class ConnectMessage extends Message {
  payload: {
    user: UserWithOnlineStateResponse;
    configuration: UserConfiguration | null;
  };

  constructor(user: UserWithOnlineStateResponse, configuration: UserConfiguration | null, messageId?: string) {
    super(MessageType.Connect, messageId);

    this.payload = {
      user: user,
      configuration: configuration,
    };
  }
}
