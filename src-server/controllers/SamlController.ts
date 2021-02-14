import { log } from '../logger';
import { Response, NextFunction } from 'express';
import { userRepository as users } from '../worker';
import { SamlAuthenticationProvider } from '../security/authentication/SamlAuthenticationProvider';
import { UserRole } from '../models/UserRole';
import { TokenHelper } from '../helpers/TokenHelper';
import { InvalidSamlAttributeException } from '../exceptions/InvalidSamlAttributeException';
import { RequestWithProfile } from '../helpers/SamlPassportHelper';
import { UserActivity } from '../models/UserActivity';

const authenticate = async (req: RequestWithProfile, res: Response, next: NextFunction) => {
  try {
    log.debug(req.profile);

    let user = await users.getByNameId(req.resource.account, req.profile.nameID as string);

    if (!user) {
      const provider = new SamlAuthenticationProvider();

      const authentication = await provider.create(<string>req.profile.nameID);

      if (!req.profile.role || !Object.values(UserRole).includes(req.profile.role)) {
        throw new InvalidSamlAttributeException(`role ${req.profile.role} is unknown`);
      }

      if (!req.profile.name) {
        throw new InvalidSamlAttributeException(`name is missing`);
      }

      user = await users.create(
        req.profile.name,
        undefined,
        new Set(['none']),
        req.resource.account.id,
        authentication,
        req.profile.role,
        UserActivity.Unknown
      );
    }

    const token = TokenHelper.createJwt(user, 14400);

    log.info(`authenticated ${req.profile.nameID} name: ${req.profile.name} role: ${req.profile.role} token: ${token}`);

    res.redirect(`${process.env.PUBLIC_BASE_URL}?token=${token}`);
  } catch (error) {
    return next(error);
  }
};

export const SamlController = {
  authenticate,
};
