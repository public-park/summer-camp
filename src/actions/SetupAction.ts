import { PhoneNumber, SetupStore, ValidationResult } from '../store/SetupStore';

export enum SetupActionType {
  SETUP_PHONE_NUMBERS_UPDATE = 'SETUP_PHONE_NUMBERS_UPDATE',
  SETUP_TWILIO_ACCOUNT_RESET = 'SETUP_TWILIO_ACCOUNT_RESET',
  SETUP_TWILIO_ACCOUNT_UPDATE = 'SETUP_TWILIO_ACCOUNT_UPDATE',
  SETUP_TWILIO_OUTBOUND_UPDATE = 'SETUP_TWILIO_OUTBOUND_UPDATE',
  SETUP_TWILIO_INBOUND_UPDATE = 'SETUP_TWILIO_INBOUND_UPDATE',
  SETUP_FETCH_CONFIGURATION_OPEN = 'SETUP_FETCH_CONFIGURATION_OPEN',
  SETUP_FETCH_CONFIGURATION_COMPLETE = 'SETUP_FETCH_CONFIGURATION_COMPLETE',
  SETUP_VALIDATE_CONFIGURATION_OPEN = 'SETUP_VALIDATE_CONFIGURATION_OPEN',
  SETUP_VALIDATE_CONFIGURATION_COMPLETE = 'SETUP_VALIDATE_CONFIGURATION_COMPLETE',
  SETUP_VALIDATE_CONFIGURATION_LOCAL = 'SETUP_VALIDATE_CONFIGURATION_LOCAL',
  SETUP_SAVE_CONFIGURATION_OPEN = 'SETUP_SAVE_CONFIGURATION_OPEN',
  SETUP_SAVE_CONFIGURATION_COMPLETE = 'SETUP_SAVE_CONFIGURATION_COMPLETE',
}

export interface PhoneNumberAction {
  type: SetupActionType;
  payload: { callerIds: Array<PhoneNumber>; phoneNumbers: Array<PhoneNumber> };
}

export const updatePhoneNumbers = (callerIds: PhoneNumber[], phoneNumbers: PhoneNumber[]): PhoneNumberAction => {
  return {
    type: SetupActionType.SETUP_PHONE_NUMBERS_UPDATE,
    payload: { phoneNumbers, callerIds },
  };
};

export interface TwilioAccountResetAction {
  type: SetupActionType;
}

export const resetTwilioAccount = (): TwilioAccountResetAction => {
  return {
    type: SetupActionType.SETUP_TWILIO_ACCOUNT_RESET,
  };
};

export interface TwilioAccountAction {
  type: SetupActionType;
  payload: { accountSid: string; key: string; secret: string };
}

export const updateTwilioAccount = (accountSid: string, key: string, secret: string): TwilioAccountAction => {
  return {
    type: SetupActionType.SETUP_TWILIO_ACCOUNT_UPDATE,
    payload: { accountSid, key, secret },
  };
};

export interface TwilioInboundAction {
  type: SetupActionType;
  payload: { isEnabled: boolean; phoneNumber: string | undefined };
}

export const updateTwilioInbound = (isEnabled: boolean, phoneNumber?: string | undefined): TwilioInboundAction => {
  return {
    type: SetupActionType.SETUP_TWILIO_INBOUND_UPDATE,
    payload: { isEnabled, phoneNumber },
  };
};

export interface TwilioOutboundAction {
  type: SetupActionType;
  payload: { isEnabled: boolean; mode: 'internal-caller-id' | 'external-caller-id'; phoneNumber: string | undefined };
}

export const updateTwilioOutbound = (
  isEnabled: boolean,
  mode: 'internal-caller-id' | 'external-caller-id',
  phoneNumber?: string | undefined
): TwilioOutboundAction => {
  return {
    type: SetupActionType.SETUP_TWILIO_OUTBOUND_UPDATE,
    payload: { isEnabled, mode, phoneNumber },
  };
};

export interface FetchConfigurationAction {
  type: SetupActionType;
}

export const fetchConfiguration = (): FetchConfigurationAction => {
  return {
    type: SetupActionType.SETUP_FETCH_CONFIGURATION_OPEN,
  };
};

export interface FetchConfigurationCompleteAction {
  type: SetupActionType;
  payload: SetupStore['configuration']['twilio'];
}

export const fetchConfigurationComplete = (
  configuration: SetupStore['configuration']['twilio']
): FetchConfigurationCompleteAction => {
  return {
    type: SetupActionType.SETUP_FETCH_CONFIGURATION_COMPLETE,
    payload: configuration,
  };
};

export interface ValidateConfigurationAction {
  type: SetupActionType;
}

export const validateConfiguration = (): ValidateConfigurationAction => {
  return {
    type: SetupActionType.SETUP_VALIDATE_CONFIGURATION_OPEN,
  };
};

export interface ValidateConfigurationCompleteAction {
  type: SetupActionType;
  payload: ValidationResult;
}

export const validateConfigurationComplete = (result: ValidationResult): ValidateConfigurationCompleteAction => {
  return {
    type: SetupActionType.SETUP_VALIDATE_CONFIGURATION_COMPLETE,
    payload: result,
  };
};

export interface ValidateConfigurationLocalAction {
  type: SetupActionType;
  payload: ValidationResult;
}

export const validateConfigurationLocal = (isValid: boolean, text: string = ''): ValidateConfigurationLocalAction => {
  return {
    type: SetupActionType.SETUP_VALIDATE_CONFIGURATION_LOCAL,
    payload: { isValid, text },
  };
};

export interface SaveConfigurationAction {
  type: SetupActionType;
}

export const saveConfiguration = (): SaveConfigurationAction => {
  return {
    type: SetupActionType.SETUP_SAVE_CONFIGURATION_OPEN,
  };
};

export interface SaveConfigurationCompleteAction {
  type: SetupActionType;
}

export const saveConfigurationComplete = (): SaveConfigurationCompleteAction => {
  return {
    type: SetupActionType.SETUP_SAVE_CONFIGURATION_COMPLETE,
  };
};

export type SetupAction =
  | PhoneNumberAction
  | TwilioAccountAction
  | TwilioInboundAction
  | TwilioOutboundAction
  | FetchConfigurationAction
  | FetchConfigurationCompleteAction
  | ValidateConfigurationAction
  | ValidateConfigurationCompleteAction
  | ValidateConfigurationLocalAction
  | SaveConfigurationAction
  | SaveConfigurationCompleteAction;
