import { Store } from '../store/Store';
import produce from 'immer';
import { User } from '../models/User';
import { Action } from '../actions/ActionType';
import { TwilioPhone } from '../phone/twilio/TwilioPhone';
import { DefaultStore } from '../store/DefaultStore';

const reducer = (state: Store = DefaultStore, action: Action): Store => {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'USER_CONNECTION_STATE_CHANGED':
        draft.connectionState = action.payload.state;
        break;
      case 'USER_ACTIVITY_CHANGED':
        draft.activity = action.payload.activity;
        break;
      case 'PHONE_STATE_CHANGED':
        if (action.payload.state === 'TOKEN_EXPIRED') draft.phoneToken = undefined;
        if (action.payload.state === 'IDLE') draft.call = undefined;

        draft.phoneState = draft.phone.getState();
        break;
      case 'PHONE_INCOMING_CALL':
        draft.call = action.payload.call;
        break;
      case 'PHONE_OUTGOING_CALL':
        draft.call = action.payload.call;
        break;
      case 'PHONE_TOKEN_UPDATED':
        draft.phoneToken = action.payload.token;
        break;
      case 'APPLICATION_VIEW':
        draft.view = action.payload.view;
        if (action.payload.view === 'SETUP') draft.phoneToken = undefined;
        break;
      case 'APPLICATION_LOGOUT':
        draft.user = new User();
        draft.phone = new TwilioPhone();
        draft.phoneToken = undefined;
        draft.view = 'PHONE';
        draft.call = undefined;
        draft.phoneState = draft.phone.getState();
        break;
    }
  });
};

export default reducer;
