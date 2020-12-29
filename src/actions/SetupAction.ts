import { PhoneNumber, SetupStore, ValidationResult } from '../store/SetupStore';
import {
  ActionType,
  SetupFetchConfigurationAction,
  SetupFetchConfigurationCompleteAction,
  SetupPhoneNumberAction,
  SetupSaveConfigurationAction,
  SetupSaveConfigurationCompleteAction,
  SetupTwilioAccountAction,
  SetupTwilioAccountResetAction,
  SetupTwilioInboundAction,
  SetupTwilioOutboundAction,
  SetupValidateConfigurationAction,
  SetupValidateConfigurationCompleteAction,
  SetupValidateConfigurationLocalAction,
} from './Action';

export const updatePhoneNumbers = (callerIds: PhoneNumber[], phoneNumbers: PhoneNumber[]): SetupPhoneNumberAction => {
  return {
    type: ActionType.SETUP_PHONE_NUMBERS_UPDATE,
    payload: { phoneNumbers, callerIds },
  };
};

export const resetTwilioAccount = (): SetupTwilioAccountResetAction => {
  return {
    type: ActionType.SETUP_TWILIO_ACCOUNT_RESET,
  };
};

export const updateTwilioAccount = (accountSid: string, key: string, secret: string): SetupTwilioAccountAction => {
  return {
    type: ActionType.SETUP_TWILIO_ACCOUNT_UPDATE,
    payload: { accountSid, key, secret },
  };
};

export const updateTwilioInbound = (isEnabled: boolean, phoneNumber?: string | undefined): SetupTwilioInboundAction => {
  return {
    type: ActionType.SETUP_TWILIO_INBOUND_UPDATE,
    payload: { isEnabled, phoneNumber },
  };
};

export const updateTwilioOutbound = (
  isEnabled: boolean,
  mode: 'internal-caller-id' | 'external-caller-id',
  phoneNumber?: string | undefined
): SetupTwilioOutboundAction => {
  return {
    type: ActionType.SETUP_TWILIO_OUTBOUND_UPDATE,
    payload: { isEnabled, mode, phoneNumber },
  };
};

export const fetchConfiguration = (): SetupFetchConfigurationAction => {
  return {
    type: ActionType.SETUP_FETCH_CONFIGURATION_OPEN,
  };
};

export const fetchConfigurationComplete = (
  configuration: SetupStore['configuration']['twilio']
): SetupFetchConfigurationCompleteAction => {
  return {
    type: ActionType.SETUP_FETCH_CONFIGURATION_COMPLETE,
    payload: configuration,
  };
};

export const validateConfiguration = (): SetupValidateConfigurationAction => {
  return {
    type: ActionType.SETUP_VALIDATE_CONFIGURATION_OPEN,
  };
};

export const validateConfigurationComplete = (result: ValidationResult): SetupValidateConfigurationCompleteAction => {
  return {
    type: ActionType.SETUP_VALIDATE_CONFIGURATION_COMPLETE,
    payload: result,
  };
};

export const validateConfigurationLocal = (
  isValid: boolean,
  text: string = ''
): SetupValidateConfigurationLocalAction => {
  return {
    type: ActionType.SETUP_VALIDATE_CONFIGURATION_LOCAL,
    payload: { isValid, text },
  };
};

export const saveConfiguration = (): SetupSaveConfigurationAction => {
  return {
    type: ActionType.SETUP_SAVE_CONFIGURATION_OPEN,
  };
};

export const saveConfigurationComplete = (): SetupSaveConfigurationCompleteAction => {
  return {
    type: ActionType.SETUP_SAVE_CONFIGURATION_COMPLETE,
  };
};
