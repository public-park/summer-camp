import { ActionType, ConnectionStateAction } from './Action';
import { ConnectionState } from '../models/Connection';

export const setConnectionState = (state: ConnectionState, code?: number): ConnectionStateAction => {
  return {
    type: ActionType.CONNECTION_STATE_CHANGE,
    payload: { state, code },
  };
};
