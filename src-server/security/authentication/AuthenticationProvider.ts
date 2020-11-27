export enum AuthenticationProviderType {
  SAML = 'saml',
  LocalPassword = 'local-password',
}

export interface AuthenticationProvider {
  provider: AuthenticationProviderType;
  create(...params: any): unknown;
}
