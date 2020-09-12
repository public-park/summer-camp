import { CallStatus, CallDirection } from '../phone/Call';

export interface UserMessage {
  id: string;
  payload: any;
}

export interface UserCallPayload {
  id: string;
  from: string;
  to: string;
  status: CallStatus;
  direction: CallDirection;
}

export interface UserHoldPayload {
  id: string;
  state: boolean;
}

export interface UserRecordPayload {
  id: string;
  state: boolean;
}

export interface UserAnswerPayload {
  id: string;
}
