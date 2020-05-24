export type UserPermissions =
  | 'self.token.create'
  | 'account.delete'
  | 'account.update'
  | 'account.read'
  | 'user.create'
  | 'user.read'
  | 'user.delete'
  | 'user.update'
  | 'account.configuration.update'
  | 'account.configuration.read';
