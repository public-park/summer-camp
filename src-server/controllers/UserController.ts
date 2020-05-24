import { Request, Response, NextFunction } from 'express';
import { userRepository, accountRepository, authenticationProvider, socketWorker } from '../worker';
import { UserActivity } from '../models/UserActivity';
import { AccountNotFoundException } from '../exceptions/AccountNotFoundException';
import { RequestWithUser } from '../requests/RequestWithUser';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { isValidName, isValidLabelList, isValidActivity } from './UserControllerValidator';
import { ConfigurationNotFoundException } from '../exceptions/ConfigurationNotFoundException';
import { InvalidUserPropertyException } from '../exceptions/InvalidUserPropertyException';

const create = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    await isValidName(req.body.name);

    let labels = new Set<string>();
    let activity = UserActivity.Unknown;

    if (req.body.labels) {
      isValidLabelList(req.body.labels);

      labels = new Set(req.body.labels);
    }

    if (req.body.activity) {
      isValidActivity(req.body.activity);

      activity = req.body.activity;
    }

    if (req.body.accountId !== req.user.accountId) {
      throw new InvalidUserPropertyException('accountId is not valid');
    }

    const authentication = await authenticationProvider.create(req.body.password);

    const user = await userRepository.create(name, undefined, labels, req.body.accountId, new Set(), authentication);

    res.json(user.toApiResponse());
  } catch (error) {
    return next(error);
  }
};

const fetch = async (req: RequestWithUser, res: Response, next: any) => {
  try {
    const user = await userRepository.getById(req.params.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    res.json(user.toApiResponse());
  } catch (error) {
    return next(error);
  }
};

const update = async (req: RequestWithUser, res: Response, next: any) => {
  try {
    const user = await userRepository.getById(req.params.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    if (req.body.labels) {
      isValidLabelList(req.body.labels);

      user.labels = new Set(req.body.labels);
    }

    if (req.body.activity) {
      isValidActivity(req.body.activity);

      user.activity = req.body.activity;
    }

    await userRepository.update(user);

    res.json(user.toApiResponse());
  } catch (error) {
    return next(error);
  }
};

const remove = async (req: Request, res: Response, next: any) => {
  try {
    const user = await userRepository.getById(req.params.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    await userRepository.delete(user);

    socketWorker.closeSocketByUserId(user.id);

    res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

const getPresence = async (req: RequestWithUser, res: Response, next: any) => {
  try {
    const user = await userRepository.getById(req.params.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    const payload = {
      isOnline: socketWorker.isOnline(user.id),
      isAvailable: user.isAvailable,
      activity: user.activity,
    };

    res.json(payload);
  } catch (error) {
    return next(error);
  }
};

export const getConfiguration = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const account = await accountRepository.getById(req.user.accountId);

    if (!account) {
      throw new AccountNotFoundException();
    }

    if (!account.configuration) {
      throw new ConfigurationNotFoundException();
    }

    res.json({
      inbound: account.configuration.inbound,
      outbound: account.configuration.outbound,
    });
  } catch (error) {
    return next(error);
  }
};

export const UserController = {
  getPresence,
  getConfiguration,
  fetch,
  update,
  remove,
  create,
};
