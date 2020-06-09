import { ActionType } from './ActionType';

export interface PhoneDisplayAction {
  type: ActionType;
  payload: string;
}

export const setPhoneDisplayValue = (value: string): PhoneDisplayAction => {
  return {
    type: ActionType.PHONE_DISPLAY_UPDATE,
    payload: value,
  };
};

export const setPhoneDisplayValueWithFocus = (value: string): PhoneDisplayAction => {
  return {
    type: ActionType.PHONE_DISPLAY_UPDATE_WITH_FOCUS,
    payload: value,
  };
};

export interface PhoneTokenAction {
  type: ActionType;
  payload: string;
}

export const setPhoneToken = (token: string): PhoneTokenAction => {
  return {
    type: ActionType.PHONE_TOKEN_UPDATED,
    payload: token,
  };
};

export interface PhoneConfigurationAction {
  type: ActionType;
  payload: any | undefined;
}

export const setPhoneConfiguration = (configuration?: any): PhoneConfigurationAction => {
  return {
    type: ActionType.PHONE_CONFIGURATION_UPDATED,
    payload: configuration,
  };
};
