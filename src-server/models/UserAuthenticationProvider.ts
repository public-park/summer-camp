import { AuthenticationProviderType } from '../security/authentication/AuthenticationProvider';

export interface UserAuthentication {
  provider: AuthenticationProviderType;
  [prop: string]: string | number | boolean;
}
