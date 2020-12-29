import produce from 'immer';
import { ActionType, ApplicationAction } from '../actions/Action';

import { DefaultSetupStore } from '../store/DefaultSetupStore';
import { SetupStore, SetupView } from '../store/SetupStore';

const setup = (state: SetupStore = DefaultSetupStore, action: ApplicationAction): SetupStore => {
  return produce(state, (draft) => {
    if (action.type === ActionType.SETUP_PHONE_NUMBERS_UPDATE) {
      draft.callerIds = action.payload.callerIds;
      draft.phoneNumbers = action.payload.phoneNumbers;
    }

    if (action.type === ActionType.SETUP_TWILIO_ACCOUNT_UPDATE) {
      draft.configuration.twilio.accountSid = action.payload.accountSid;
      draft.configuration.twilio.key = action.payload.key;
      draft.configuration.twilio.secret = action.payload.secret;

      draft.view = SetupView.PHONE_NUMBER_FORM;
    }

    if (action.type === ActionType.SETUP_TWILIO_ACCOUNT_RESET) {
      draft.configuration.twilio.inbound = {
        isEnabled: false,
        phoneNumber: undefined,
      };

      draft.configuration.twilio.outbound = {
        isEnabled: false,
        mode: 'external-caller-id',
        phoneNumber: undefined,
      };

      draft.view = SetupView.ACCOUNT_FORM;
    }

    if (action.type === ActionType.SETUP_TWILIO_INBOUND_UPDATE) {
      draft.configuration.twilio.inbound = {
        ...action.payload,
      };
    }

    if (action.type === ActionType.SETUP_TWILIO_OUTBOUND_UPDATE) {
      draft.configuration.twilio.outbound = {
        ...action.payload,
      };
    }

    if (action.type === ActionType.SETUP_FETCH_CONFIGURATION_OPEN) {
      draft.view = SetupView.FETCH;
      draft.configuration = DefaultSetupStore.configuration;
    }

    if (action.type === ActionType.SETUP_FETCH_CONFIGURATION_COMPLETE) {
      if (action.payload) {
        draft.view = SetupView.FETCH_COMPLETE;
        draft.configuration.twilio = {
          ...action.payload,
        };
      } else {
        draft.view = SetupView.ACCOUNT_FORM;
      }

      draft.callerIds = [];
      draft.phoneNumbers = [];
    }

    if (action.type === ActionType.SETUP_VALIDATE_CONFIGURATION_OPEN) {
      draft.view = SetupView.VALIDATE;
    }

    if (action.type === ActionType.SETUP_VALIDATE_CONFIGURATION_COMPLETE) {
      draft.validation.remote = action.payload;

      if (action.payload.isValid) {
        draft.view = SetupView.PHONE_NUMBER_FORM;
      } else {
        if (!['CALLER_ID_NOT_ON_ACCOUNT', 'PHONE_NUMBER_NOT_ON_ACCOUNT'].includes(action.payload.text)) {
          draft.view = SetupView.ACCOUNT_FORM;
        } else {
          draft.view = SetupView.PHONE_NUMBER_FORM;
        }
      }
    }

    if (action.type === ActionType.SETUP_VALIDATE_CONFIGURATION_LOCAL) {
      draft.validation.local = action.payload;
    }

    if (action.type === ActionType.SETUP_SAVE_CONFIGURATION_OPEN) {
      draft.isSaving = true;
    }

    if (action.type === ActionType.SETUP_SAVE_CONFIGURATION_COMPLETE) {
      draft.isSaving = false;
    }
  });
};

export default setup;
