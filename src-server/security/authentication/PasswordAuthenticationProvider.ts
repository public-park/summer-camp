import { AuthenticationProvider } from './AuthenticationProvider';
import { compare, hash } from 'bcrypt';
import { User, UserAuthentication } from '../../models/User';
import { InvalidAuthenticationRecordException } from './exceptions/InvalidAuthenticationRecordException';
import { AuthenticationRecordNotFoundException } from './exceptions/AuthenticationRecordNotFoundException';

export interface PasswordUserAuthentication extends UserAuthentication {
  secret: string;
}

export class PasswordAuthenticationProvider implements AuthenticationProvider {
  authenticate = async (user: User, password: string): Promise<boolean> => {
    if (!user.authentication) {
      throw new AuthenticationRecordNotFoundException();
    }

    const authenticate = user.authentication as PasswordUserAuthentication;

    if (authenticate.provider !== 'local-password') {
      throw new InvalidAuthenticationRecordException();
    }

    if (!authenticate.secret) {
      throw new InvalidAuthenticationRecordException();
    }

    return await compare(password, authenticate.secret);
  };

  create = async (password: string): Promise<PasswordUserAuthentication> => {
    const secret = await hash(password, 10);

    const payload = {
      provider: 'local-password',
      secret: secret,
    };
    return payload;
  };
}
