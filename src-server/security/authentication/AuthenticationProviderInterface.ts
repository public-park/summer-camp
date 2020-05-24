export interface AuthenticationProviderInterface {
  authenticate: (...params: any) => Promise<boolean>;
  create(...params: any): any;
}
