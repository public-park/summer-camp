import { UserActivity } from '../../UserActivity';
import { Message, MessageType } from './Message';

export class ActivityMessage extends Message {
  payload: {
    activity: UserActivity;
  };

  constructor(activity: UserActivity, messageId?: string) {
    super(MessageType.Activity, messageId);

    this.payload = {
      activity: activity,
    };
  }
}
