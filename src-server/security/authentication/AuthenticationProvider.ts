export interface AuthenticationProvider {
  authenticate: (...params: any) => Promise<boolean>;
  create(...params: any): any;
}
