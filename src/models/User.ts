import { EventEmitter } from 'events';
import { UserActivity } from './UserActivity';
import { UserRole } from './UserRole';
import { MessageType } from './socket/messages/Message';
import { ActivityMessage } from './socket/messages/ActivityMessage';
import { TagMessage } from './socket/messages/TagMessage';
import { ConnectMessage } from './socket/messages/ConnectMessage';
import { UserConfiguration } from './UserConfiguration';
import { Connection, ConnectionState } from './Connection';

enum UserEventType {
  Activity = 'user_activity',
  Tags = 'user_tags',
  Ready = 'user_ready',
}

export class User {
  id: string | undefined;
  name: string | undefined;
  profileImageUrl: string | undefined;
  accountId: string | undefined;
  tags: Set<string>;
  activity: UserActivity;
  role: UserRole | undefined;
  configuration: UserConfiguration | undefined;
  connection: Connection;

  private events: EventEmitter;

  constructor(connection: Connection) {
    this.events = new EventEmitter();

    this.id = undefined;
    this.name = undefined;
    this.profileImageUrl = undefined;
    this.accountId = undefined;
    this.tags = new Set();
    this.activity = UserActivity.Unknown;
    this.role = undefined;

    connection.on<ConnectMessage>(MessageType.Connect, (message: ConnectMessage) => {
      const {
        payload: { user, configuration },
      } = message as ConnectMessage;

      this.id = user.id;
      this.name = user.name;
      this.profileImageUrl = user.profileImageUrl;
      this.accountId = user.accountId;
      this.tags = new Set(user.tags);
      this.role = user.role;
      this.activity = user.activity;
      this.configuration = configuration;

      this.events.emit(UserEventType.Ready, this);
    });

    connection.on<ActivityMessage>(MessageType.Activity, (message: ActivityMessage) => {
      this.activity = message.payload.activity;
    });

    connection.on<TagMessage>(MessageType.Tags, (message: TagMessage) => {
      this.tags = new Set(message.payload.tags);
    });

    this.connection = connection;
  }

  isAvailable() {
    return this.activity === UserActivity.WaitingForWork;
  }

  isOnline() {
    return this.connection.state === ConnectionState.Open;
  }

  async setTags(tags: Set<string>) {
    console.info(`set tags to: ${tags}`);

    await this.connection.send(new TagMessage(tags));

    this.tags = tags;

    this.events.emit(UserEventType.Tags, tags);
  }

  async setActivity(activity: UserActivity) {
    console.info(`set state to: ${activity}`);

    await this.connection.send(new ActivityMessage(activity));

    this.activity = activity;

    this.events.emit(UserEventType.Activity, activity);
  }

  onActivityChanged(listener: (activity: UserActivity) => void) {
    this.events.on(UserEventType.Activity, listener);
  }

  onTagsChanged(listener: (activity: UserActivity) => void) {
    this.events.on(UserEventType.Activity, listener);
  }

  onReady(listener: () => void) {
    this.events.on(UserEventType.Ready, listener);
  }
}
