import { ConnectionState } from '../models/Connection';
import { LocalStorageContext } from '../services/LocalStorageContext';
import {
  ActionType,
  ApplicationLoginAction,
  ApplicationLogoutAction,
  ApplicationPageLoadAction,
  ConnectionStateAction,
} from './Action';

export const setLogout = (reason?: string): ApplicationLogoutAction => {
  return {
    type: ActionType.APPLICATON_LOGOUT,
    payload: { reason: reason },
  };
};

export const setLogin = (token: string): ApplicationLoginAction => {
  return {
    type: ActionType.APPLICATION_LOGIN,
    payload: { token: token },
  };
};

export const onPageLoad = (context: LocalStorageContext): ApplicationPageLoadAction => {
  return {
    type: ActionType.APPLICATION_PAGE_LOAD,
    payload: context,
  };
};

export const setConnectionState = (state: ConnectionState, code?: number): ConnectionStateAction => {
  return {
    type: ActionType.CONNECTION_STATE_CHANGE,
    payload: { state, code },
  };
};
