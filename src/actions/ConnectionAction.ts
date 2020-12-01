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

export const setLogout = (reason?: string) => {
  return {
    type: ActionType.USER_LOGOUT,
    payload: { reason: reason },
  };
};

export const setLogin = (token: string) => {
  return {
    type: ActionType.USER_LOGIN,
    payload: { token: token },
  };
};
