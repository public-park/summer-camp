import { Response } from 'express';
import { UserActivity } from '../models/UserActivity';
import { RequestWithUser } from '../requests/RequestWithUser';
import { pool } from '../worker';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { CallStatus } from '../models/CallStatus';

interface UserPresenceResponse {
  isOnline: boolean;
  isAvailable: boolean;
  activity: UserActivity;
  call?: {
    id: string;
    from: string;
    to: string;
    status: CallStatus;
  };
}

const get = async (req: RequestWithUser, res: Response, next: any) => {
  try {
    const user = await pool.getByIdWithFallback(req.user.account, req.params.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    const payload: UserPresenceResponse = {
      isOnline: user.sockets.length() > 0,
      isAvailable: user.isAvailable,
      activity: user.activity,
    };
    // TODO add call pool
    if (user.call) {
      payload.call = {
        id: user.call.id,
        from: user.call.from,
        to: user.call.to,
        status: user.call.status,
      };
    }

    res.json(payload);
  } catch (error) {
    return next(error);
  }
};

export const UserPresenceController = {
  get,
};
