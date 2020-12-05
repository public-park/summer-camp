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
