import { LocalStorageContext } from '../services/LocalStorageContext';
import { ActionType } from './ActionType';

export enum ApplicationActionType {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  PAGE_LOAD = 'PAGE_LOAD',
}

export interface LogoutAction {
  type: ApplicationActionType;
  payload: {
    reason?: string;
  };
}

export const setLogout = (reason?: string): LogoutAction => {
  return {
    type: ApplicationActionType.USER_LOGOUT,
    payload: { reason: reason },
  };
};

export interface LoginAction {
  type: ActionType;
  payload: {
    token: string;
  };
}

export const setLogin = (token: string) => {
  return {
    type: ApplicationActionType.USER_LOGIN,
    payload: { token: token },
  };
};

export interface PageLoadAction {
  type: ApplicationActionType;
  payload: LocalStorageContext;
}

export const onPageLoad = (context: LocalStorageContext) => {
  return {
    type: ApplicationActionType.PAGE_LOAD,
    payload: context,
  };
};

export type ApplicationAction = LoginAction | LogoutAction | PageLoadAction;
