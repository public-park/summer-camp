import { EventEmitter } from 'events';
import { UserActivity } from './UserActivity';
import { UserRole } from './UserRole';
import { MessageType } from './socket/messages/Message';
import { ActivityMessage } from './socket/messages/ActivityMessage';
import { TagMessage } from './socket/messages/TagMessage';
import { Connection, ConnectionState } from './Connection';

enum UserEventType {
  Activity = 'user_activity',
  Tags = 'user_tags',
  Ready = 'user_ready',
}

export class User {
  id: string;
  name: string;
  profileImageUrl: string | undefined;
  accountId: string;
  tags: Set<string>;
  activity: UserActivity;
  role: UserRole;
  connection: Connection;

  private events: EventEmitter;

  constructor(
    connection: Connection,
    id: string,
    name: string,
    profileImageUrl: string | undefined,
    accountId: string,
    tags: Set<string> = new Set(),
    activity: UserActivity,
    role: UserRole
  ) {
    this.events = new EventEmitter();

    this.id = id;
    this.name = name;
    this.profileImageUrl = profileImageUrl;
    this.accountId = accountId;
    this.tags = tags;
    this.activity = activity;
    this.role = role;

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
