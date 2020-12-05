import { ApplicationStore } from './ApplicationStore';
import { PhoneStore } from './PhoneStore';
import { SetupStore } from './SetupStore';
import { UserStore } from './UserStore';

export const selectUser = (store: Store) => store.user;
export const selectPhone = (store: Store) => store.phone;
export const selectConfiguration = (store: Store) => store.phone.configuration;
export const selectCall = (store: Store) => store.application.call;
export const selectPhoneState = (store: Store) => store.phone.state;
export const selectPhoneToken = (store: Store) => store.phone.token;
export const selectPhoneInputDevice = (store: Store) => store.phone.devices.input;
export const selectPhoneOutputDevice = (store: Store) => store.phone.devices.output;
export const selectWorkspaceView = (store: Store) => store.application.workspace.view;
export const selectWorkspaceNotification = (store: Store) => store.application.workspace.notification;
export const selectConnectionState = (store: Store) => store.application.connection.state;
export const selectToken = (store: Store) => store.application.token;
export const selectPage = (store: Store) => store.application.page;
export const selectLogoutReason = (store: Store) => store.application.logout.reason;
export const selectPhoneError = (store: Store) => store.phone.error;
export const selectPhoneDisplay = (store: Store) => store.phone.display;
export const selectAudioInputDevices = (store: Store) => store.application.devices.audio.input;
export const selectAudioOutputDevices = (store: Store) => store.application.devices.audio.output;
export const selectDeviceException = (store: Store) => store.application.devices.exception;
export const selectTeam = (store: Store) => store.application.users; // TODO rename to team?

export const selectSetupView = (store: Store) => store.setup.view;
export const selectSetupConfiguration = (store: Store) => store.setup.configuration;

export const selectSetupCallerIds = (store: Store) => store.setup.callerIds;
export const selectSetupPhoneNumbers = (store: Store) => store.setup.phoneNumbers;
export const selectSetupValidation = (store: Store) => store.setup.validation;
export const selectSetupIsSaving = (store: Store) => store.setup.isSaving;

export interface Store {
  application: ApplicationStore;
  setup: SetupStore;
  user: UserStore;
  phone: PhoneStore;
}
