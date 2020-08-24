import { UserActivity } from '../models/UserActivity';
import { User, UserResponse } from '../models/User';
import { Call } from '../models/Call';
import { UserRepository } from '../repository/UserRepository';
import { WebSocketWithKeepAlive } from '../WebSocketWithKeepAlive';
import { CallStatus } from '../models/CallStatus';

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

  get() {
    return this.sockets;
  }

  length() {
    return this.sockets.length;
  }
}

export interface UserWithOnlineStateResponse extends UserResponse {
  call: {
    id: string;
    from: string;
    to: string;
    status: CallStatus | undefined;
  } | null;
  sockets: number;
}

export class UserWithOnlineState extends User {
  call: Call | undefined;
  users: UserRepository;
  sockets: UserSockets;

  constructor(user: User, sockets: Array<WebSocketWithKeepAlive>, users: UserRepository) {
    super(
      user.id,
      user.name,
      user.profileImageUrl,
      user.tags,
      user.activity,
      user.account,
      user.authentication,
      user.role,
      user.createdAt
    );

    this.call = undefined;
    this.users = users;
    this.sockets = new UserSockets(sockets);
  }

  get isAvailable(): boolean {
    return this.activity === UserActivity.WaitingForWork && !this.call;
  }

  async persist(): Promise<void> {
    await this.users.update(this.account, this);
  }

  toResponse(): UserWithOnlineStateResponse {
    const response = super.toResponse() as UserWithOnlineStateResponse;

    if (this.call) {
      response.call = { id: this.call.id, from: this.call.from, to: this.call.to, status: this.call.status };
    } else {
      response.call = null;
    }

    response.sockets = this.sockets.length();

    return response;
  }

  updateCallAndBroadcast(call: Call) {
    this.call = call;

    if (!call.isActive()) {
      this.call = undefined;
    }

    this.broadcast({ call: this.toResponse().call });
  }

  updateCall(call: Call) {
    this.call = call;

    if (!call.isActive()) {
      this.call = undefined;
    }
  }

  broadcast(payload: object) {
    this.sockets.broadcast(JSON.stringify(payload));
  }
}
