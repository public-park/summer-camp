import { Call } from '../models/Call';
import { ConnectionState } from '../models/Connection';
import { CallStatusDocument } from '../models/documents/CallDocument';
import { PhoneConfigurationDocument } from '../models/documents/PhoneConfigurationDocument';
import { UserPresenceDocument } from '../models/documents/UserDocument';
import { UserActivity } from '../models/UserActivity';
import { PhoneState } from '../phone/PhoneState';
import { LocalStorageContext } from '../services/LocalStorageContext';
import { PhoneNumber, SetupStore, ValidationResult } from '../store/SetupStore';
import { UserStore } from '../store/UserStore';
import { WorkspaceView } from './WorkspaceAction';

export enum ActionType {
  CONNECTION_STATE_CHANGE = 'CONNECTION_STATE_CHANGE',
  CALL_STATE_CHANGE = 'CALL_STATE_CHANGE',
  AUDIO_DEVICES_CHANGE = 'AUDIO_DEVICES_CHANGE',
  AUDIO_DEVICES_EXCEPTION = 'AUDIO_DEVICES_EXCEPTION',
  WORKSPACE_VIEW = 'WORKSPACE_VIEW',
  WORKSPACE_NOTIFICATION = 'WORKSPACE_NOTIFICATION',
  APPLICATION_LOGIN = 'APPLICATION_LOGIN',
  APPLICATON_LOGOUT = 'APPLICATON_LOGOUT',
  APPLICATION_PAGE_LOAD = 'APPLICATION_PAGE_LOAD',
  USERS_LIST_UPDATE = 'USERS_LIST_UPDATE',
  PHONE_STATE_CHANGE = 'PHONE_STATE_CHANGE',
  PHONE_DISPLAY_UPDATE = 'PHONE_DISPLAY_UPDATE',
  PHONE_TOKEN_UPDATE = 'PHONE_TOKEN_UPDATE',
  PHONE_CONFIGURATION_UPDATE = 'PHONE_CONFIGURATION_UPDATE',
  PHONE_OUTPUT_DEVICE_UPDATE = 'PHONE_OUTPUT_DEVICE_UPDATE',
  PHONE_INPUT_DEVICE_UPDATE = 'PHONE_INPUT_DEVICE_UPDATE',
  PHONE_OUTPUT_DEVICE_LOST = 'PHONE_OUTPUT_DEVICE_LOST',
  PHONE_INPUT_DEVICE_LOST = 'PHONE_INPUT_DEVICE_LOST',
  PHONE_ERROR = 'PHONE_ERROR',
  PHONE_CALL_STATE_CHANGE = 'PHONE_CALL_STATE_CHANGE',
  PHONE_OVERLAY = 'PHONE_OVERLAY',
  USER_ACTIVITY_CHANGE = 'USER_ACTIVITY_CHANGE',
  USER_READY = 'USER_READY',
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

export interface Action<T extends ActionType> {
  type: T;
}

export interface AudioDevicesExceptionAction extends Action<ActionType.AUDIO_DEVICES_EXCEPTION> {
  payload: Error;
}

export interface AudioDevicesUpdateAction extends Action<ActionType.AUDIO_DEVICES_CHANGE> {
  payload: {
    input: MediaDeviceInfo[];
    output: MediaDeviceInfo[];
  };
}

export interface ConnectionStateAction extends Action<ActionType.CONNECTION_STATE_CHANGE> {
  payload: {
    state: ConnectionState;
    code: number | undefined;
  };
}

export interface NotificationAction extends Action<ActionType.WORKSPACE_NOTIFICATION> {
  type: ActionType.WORKSPACE_NOTIFICATION;
  payload: {
    isVisible: boolean;
    text: string | undefined;
  };
}

export interface UserActivityAction extends Action<ActionType.USER_ACTIVITY_CHANGE> {
  type: ActionType.USER_ACTIVITY_CHANGE;
  payload: UserActivity;
}

export interface UserReadyAction extends Action<ActionType.USER_READY> {
  type: ActionType.USER_READY;
  payload: UserStore;
}

export interface ApplicationLogoutAction extends Action<ActionType.APPLICATON_LOGOUT> {
  payload: {
    reason?: string;
  };
}

export interface ApplicationPageLoadAction extends Action<ActionType.APPLICATION_PAGE_LOAD> {
  payload: LocalStorageContext;
}

export interface ApplicationLoginAction extends Action<ActionType.APPLICATION_LOGIN> {
  payload: {
    token: string;
  };
}

export interface ApplicationLoginAction extends Action<ActionType.APPLICATION_LOGIN> {
  payload: {
    token: string;
  };
}

export interface WorkspaceViewAction extends Action<ActionType.WORKSPACE_VIEW> {
  payload: {
    view: WorkspaceView;
  };
}

export interface UserListUpdateAction extends Action<ActionType.USERS_LIST_UPDATE> {
  payload: Array<UserPresenceDocument>;
}

export interface PhoneStateAction extends Action<ActionType.PHONE_STATE_CHANGE> {
  payload: {
    state: PhoneState;
    userId: string;
  };
}

export interface PhoneDisplayAction extends Action<ActionType.PHONE_DISPLAY_UPDATE> {
  payload: string;
}

export interface PhoneTokenAction extends Action<ActionType.PHONE_TOKEN_UPDATE> {
  payload: string;
}

export interface PhoneErrorAction extends Action<ActionType.PHONE_ERROR> {
  payload: Error;
}

export interface PhoneConfigurationAction extends Action<ActionType.PHONE_CONFIGURATION_UPDATE> {
  payload: PhoneConfigurationDocument | undefined;
}

export interface PhoneInputDeviceAction extends Action<ActionType.PHONE_INPUT_DEVICE_UPDATE> {
  payload: string | undefined;
}

export interface PhoneOutputDeviceAction extends Action<ActionType.PHONE_OUTPUT_DEVICE_UPDATE> {
  payload: string | undefined;
}

export interface PhoneInputDeviceLostAction extends Action<ActionType.PHONE_INPUT_DEVICE_LOST> {
  payload: undefined;
}

export interface PhoneOutputDeviceLostAction extends Action<ActionType.PHONE_OUTPUT_DEVICE_LOST> {
  payload: undefined;
}

export interface PhoneCallStateAction extends Action<ActionType.PHONE_CALL_STATE_CHANGE> {
  payload: CallStatusDocument | undefined;
}

export interface PhoneOverlayAction extends Action<ActionType.PHONE_OVERLAY> {
  payload: boolean;
}

/* setup action */
export interface SetupTwilioAccountResetAction extends Action<ActionType.SETUP_TWILIO_ACCOUNT_RESET> {}

export interface SetupTwilioAccountAction extends Action<ActionType.SETUP_TWILIO_ACCOUNT_UPDATE> {
  payload: { accountSid: string; key: string; secret: string };
}

export interface SetupTwilioInboundAction extends Action<ActionType.SETUP_TWILIO_INBOUND_UPDATE> {
  payload: { isEnabled: boolean; phoneNumber: string | undefined };
}

export interface SetupTwilioOutboundAction extends Action<ActionType.SETUP_TWILIO_OUTBOUND_UPDATE> {
  payload: { isEnabled: boolean; mode: 'internal-caller-id' | 'external-caller-id'; phoneNumber: string | undefined };
}

export interface SetupPhoneNumberAction extends Action<ActionType.SETUP_PHONE_NUMBERS_UPDATE> {
  payload: { callerIds: Array<PhoneNumber>; phoneNumbers: Array<PhoneNumber> };
}

export interface SetupFetchConfigurationAction extends Action<ActionType.SETUP_FETCH_CONFIGURATION_OPEN> {}

export interface SetupFetchConfigurationCompleteAction extends Action<ActionType.SETUP_FETCH_CONFIGURATION_COMPLETE> {
  payload: SetupStore['configuration']['twilio'];
}

export interface SetupValidateConfigurationAction extends Action<ActionType.SETUP_VALIDATE_CONFIGURATION_OPEN> {}

export interface SetupValidateConfigurationCompleteAction
  extends Action<ActionType.SETUP_VALIDATE_CONFIGURATION_COMPLETE> {
  payload: ValidationResult;
}

export interface SetupValidateConfigurationLocalAction extends Action<ActionType.SETUP_VALIDATE_CONFIGURATION_LOCAL> {
  payload: ValidationResult;
}

export interface SetupSaveConfigurationAction extends Action<ActionType.SETUP_SAVE_CONFIGURATION_OPEN> {}

export interface SetupSaveConfigurationCompleteAction extends Action<ActionType.SETUP_SAVE_CONFIGURATION_COMPLETE> {}

export type ApplicationAction =
  | AudioDevicesExceptionAction
  | AudioDevicesUpdateAction
  | ConnectionStateAction
  | NotificationAction
  | UserActivityAction
  | UserReadyAction
  | ApplicationLogoutAction
  | ApplicationPageLoadAction
  | ApplicationLoginAction
  | WorkspaceViewAction
  | UserListUpdateAction
  | PhoneStateAction
  | PhoneErrorAction
  | PhoneDisplayAction
  | PhoneTokenAction
  | PhoneConfigurationAction
  | PhoneInputDeviceAction
  | PhoneOutputDeviceAction
  | PhoneInputDeviceLostAction
  | PhoneOutputDeviceLostAction
  | PhoneCallStateAction
  | PhoneOverlayAction
  | SetupFetchConfigurationAction
  | SetupFetchConfigurationCompleteAction
  | SetupPhoneNumberAction
  | SetupSaveConfigurationAction
  | SetupSaveConfigurationCompleteAction
  | SetupTwilioAccountAction
  | SetupTwilioAccountResetAction
  | SetupTwilioInboundAction
  | SetupTwilioOutboundAction
  | SetupValidateConfigurationAction
  | SetupValidateConfigurationCompleteAction
  | SetupValidateConfigurationLocalAction;
