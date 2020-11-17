import { UserRepository } from '../repository/UserRepository';
import { WebSocketWithKeepAlive } from '../WebSocketWithKeepAlive';
import { Account } from './Account';
import { Call } from './Call';
import { PresenceDocument, UserWithPresenceDocument } from './documents/UserDocument';
import { User } from './User';
import { UserActivity } from './UserActivity';

export class UserSockets {
  private sockets: Array<WebSocketWithKeepAlive>;

  constructor(sockets: Array<WebSocketWithKeepAlive> = []) {
    this.sockets = sockets;
  }

  add(socket: WebSocketWithKeepAlive) {
    this.sockets.push(socket);
  }

  remove(socket: WebSocketWithKeepAlive) {
    this.sockets = this.sockets.filter((s) => s !== socket);
  }

  broadcast(payload: string) {
    this.sockets.forEach((sockets) => {
      sockets.send(payload);
    });
  }

  close(code: number) {
    this.sockets.forEach((sockets) => {
      sockets.close(code);
    });

    this.sockets = [];
  }

  get() {
    return this.sockets;
  }

  length() {
    return this.sockets.length;
  }
}

export class UserWithSocket extends User {
  readonly account: Account;
  call: Call | undefined;
  users: UserRepository;
  sockets: UserSockets;

  constructor(account: Account, user: User, sockets: Array<WebSocketWithKeepAlive>, users: UserRepository) {
    super(
      user.id,
      user.name,
      user.profileImageUrl,
      user.tags,
      user.activity,
      account.id,
      user.authentication,
      user.role,
      user.createdAt
    );

    this.account = account;
    this.call = undefined;
    this.users = users;
    this.sockets = new UserSockets(sockets);
  }

  get isAvailable(): boolean {
    return this.activity === UserActivity.WaitingForWork && !this.call;
  }

  get isConnected(): boolean {
    return this.sockets.length() > 0;
  }

  async save(): Promise<void> {
    await this.users.save(this);
  }

  toUserWithPresenceDocument(): UserWithPresenceDocument {
    const { id, name, profileImageUrl, tags, role, accountId } = super.toDocument();

    const response: UserWithPresenceDocument = {
      id,
      name,
      profileImageUrl,
      tags,
      role,
      accountId,
      ...this.toPresenceDocument(),
    };

    return response;
  }

  toPresenceDocument(): PresenceDocument {
    const response: PresenceDocument = {
      activity: this.activity,
      isOnline: this.isConnected,
      isAvailable: this.isAvailable,
      call: null,
    };

    // TODO, fix naming isOnline: this.isConnected

    if (this.call) {
      response.call = {
        id: this.call.id,
        from: this.call.from,
        to: this.call.to,
        status: this.call.status,
        direction: this.call.direction,
      };
    } else {
      response.call = null;
    }

    response.isOnline = this.sockets.length() !== 0 ? true : false;

    return response;
  }

  broadcast(payload: object) {
    this.sockets.broadcast(JSON.stringify(payload));
  }
}
