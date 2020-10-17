import { SetupStore, SetupView } from './SetupStore';

export const DefaultSetupStore: SetupStore = {
  view: SetupView.FETCH,
  error: undefined,
  configuration: {
    twilio: {
      accountSid: undefined,
      key: undefined,
      secret: undefined,
      inbound: {
        isEnabled: false,
        phoneNumber: undefined,
      },
      outbound: {
        isEnabled: false,
        mode: 'internal-caller-id',
        phoneNumber: undefined,
      },
    },
    microsoft: {
      connectionString: undefined,
    },
  },
  callerIds: [],
  phoneNumbers: [],
  validation: {
    local: { isValid: true, text: '' },
    remote: { isValid: true, text: '' },
  },
  isSaving: false,
};
