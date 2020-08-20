import { AuthenticationProvider, AuthenticationProviderType } from './AuthenticationProvider';
import { UserAuthentication } from '../../models/UserAuthenticationProvider';

export interface SamlUserAuthentication extends UserAuthentication {
  nameId: string;
}

export class SamlAuthenticationProvider implements AuthenticationProvider {
  provider = AuthenticationProviderType.SAML;

  create = async (nameId: string): Promise<SamlUserAuthentication> => {
    const payload = {
      provider: this.provider,
      nameId: nameId,
    };
    return Promise.resolve(payload);
  };
}
