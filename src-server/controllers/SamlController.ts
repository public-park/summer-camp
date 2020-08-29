import { log } from '../logger';
import { Response, NextFunction } from 'express';
import { userRepository } from '../worker';
import { SamlAuthenticationProvider } from '../security/authentication/SamlAuthenticationProvider';
import { UserRole } from '../models/UserRole';
import { TokenHelper } from '../helpers/TokenHelper';
import { RequestWithProfile } from '../saml-config2';
import { InvalidSamlAttributeException } from '../exceptions/InvalidSamlAttributeException';

const authenticate = async (req: RequestWithProfile, res: Response, next: NextFunction) => {
  try {
    log.debug(req.profile);

    let user = await userRepository.getByNameId(req.account, req.profile.nameID);

    if (!user) {
      const provider = new SamlAuthenticationProvider();

      const authentication = await provider.create(req.profile.nameID);

      if (!Object.values(UserRole).includes(req.profile.role)) {
        throw new InvalidSamlAttributeException(`role ${req.profile.role} is unknown`);
      }

      if (!req.profile.name) {
        throw new InvalidSamlAttributeException(`name is missing`);
      }

      user = await userRepository.create(
        req.profile.name,
        undefined,
        new Set(['none']),
        req.account,
        authentication,
        req.profile.role
      );
    }

    const token = TokenHelper.createJwt(user, 14400);

    log.info(`authenticated ${req.profile.nameID} name: ${req.profile.name} role: ${req.profile.role} token: ${token}`);

    res.redirect(`${process.env.SAML_AUTHENTICATION_PUBLIC_URL}?token=${token}`);
  } catch (error) {
    return next(error);
  }
};

export const SamlController = {
  authenticate,
};
