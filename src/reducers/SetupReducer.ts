import produce from 'immer';
import {
  FetchConfigurationAction,
  FetchConfigurationCompleteAction,
  PhoneNumberAction,
  SaveConfigurationAction,
  SaveConfigurationCompleteAction,
  SetupAction,
  SetupActionType,
  TwilioAccountAction,
  TwilioAccountResetAction,
  TwilioInboundAction,
  TwilioOutboundAction,
  ValidateConfigurationAction,
  ValidateConfigurationCompleteAction,
  ValidateConfigurationLocalAction,
} from '../actions/SetupAction';
import { DefaultSetupStore } from '../store/DefaultSetupStore';
import { SetupStore, SetupView } from '../store/SetupStore';

const isPhoneNumberAction = (action: SetupAction): action is PhoneNumberAction => {
  return action.type === SetupActionType.PHONE_NUMBERS_UPDATE;
};

const isTwilioAccountAction = (action: SetupAction): action is TwilioAccountAction => {
  return action.type === SetupActionType.TWILIO_ACCOUNT_UPDATE;
};

const isTwilioAccountResetAction = (action: SetupAction): action is TwilioAccountResetAction => {
  return action.type === SetupActionType.TWILIO_ACCOUNT_RESET;
};

const isTwilioOutboundAction = (action: SetupAction): action is TwilioOutboundAction => {
  return action.type === SetupActionType.TWILIO_OUTBOUND_UPDATE;
};

const isTwilioInboundAction = (action: SetupAction): action is TwilioInboundAction => {
  return action.type === SetupActionType.TWILIO_INBOUND_UPDATE;
};

const isFetchConfigurationAction = (action: SetupAction): action is FetchConfigurationAction => {
  return action.type === SetupActionType.FETCH_CONFIGURATION_OPEN;
};

const isFetchConfigurationCompleteAction = (action: SetupAction): action is FetchConfigurationCompleteAction => {
  return action.type === SetupActionType.FETCH_CONFIGURATION_COMPLETE;
};

const isValidateConfigurationAction = (action: SetupAction): action is ValidateConfigurationAction => {
  return action.type === SetupActionType.VALIDATE_CONFIGURATION_OPEN;
};

const isValidateConfigurationCompleteAction = (action: SetupAction): action is ValidateConfigurationCompleteAction => {
  return action.type === SetupActionType.VALIDATE_CONFIGURATION_COMPLETE;
};

const isValidateConfigurationLocalAction = (action: SetupAction): action is ValidateConfigurationLocalAction => {
  return action.type === SetupActionType.VALIDATE_CONFIGURATION_LOCAL;
};

const isSaveConfigurationAction = (action: SetupAction): action is SaveConfigurationAction => {
  return action.type === SetupActionType.SAVE_CONFIGURATION_OPEN;
};

const isSaveConfigurationCompleteAction = (action: SetupAction): action is SaveConfigurationCompleteAction => {
  return action.type === SetupActionType.SAVE_CONFIGURATION_COMPLETE;
};

const setup = (state: SetupStore = DefaultSetupStore, action: SetupAction): SetupStore => {
  return produce(state, (draft) => {
    if (isPhoneNumberAction(action)) {
      draft.callerIds = action.payload.callerIds;
      draft.phoneNumbers = action.payload.phoneNumbers;
    }

    if (isTwilioAccountAction(action)) {
      draft.configuration.twilio.accountSid = action.payload.accountSid;
      draft.configuration.twilio.key = action.payload.key;
      draft.configuration.twilio.secret = action.payload.secret;

      draft.view = SetupView.PHONE_NUMBER_FORM;
    }

    if (isTwilioAccountResetAction(action)) {
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

    if (isTwilioInboundAction(action)) {
      draft.configuration.twilio.inbound = {
        ...action.payload,
      };
    }

    if (isTwilioOutboundAction(action)) {
      draft.configuration.twilio.outbound = {
        ...action.payload,
      };
    }

    if (isFetchConfigurationAction(action)) {
      draft.view = SetupView.FETCH;
      draft.configuration = DefaultSetupStore.configuration;
    }

    if (isFetchConfigurationCompleteAction(action)) {
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

    if (isValidateConfigurationAction(action)) {
      draft.view = SetupView.VALIDATE;
    }

    if (isValidateConfigurationCompleteAction(action)) {
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

    if (isValidateConfigurationLocalAction(action)) {
      draft.validation.local = action.payload;
    }

    if (isSaveConfigurationAction(action)) {
      draft.isSaving = true;
    }

    if (isSaveConfigurationCompleteAction(action)) {
      draft.isSaving = false;
    }
  });
};

export default setup;
