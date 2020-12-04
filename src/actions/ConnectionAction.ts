import { ActionType } from './ActionType';
import { ConnectionState } from '../models/Connection';

export interface ConnectionStateAction {
  type: ActionType;
  payload: {
    state: ConnectionState;
    code: number | undefined;
  };
}

export const setConnectionState = (state: ConnectionState, code: number | undefined): ConnectionStateAction => {
  return {
    type: ActionType.CONNECTION_STATE_CHANGE,
    payload: { state, code },
  };
};

export interface LogoutAction {
  type: ActionType;
  payload: {
    reason?: string;
  };
}

export const setLogout = (reason?: string): LogoutAction => {
  return {
    type: ActionType.USER_LOGOUT,
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
    type: ActionType.USER_LOGIN,
    payload: { token: token },
  };
};
