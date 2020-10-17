export enum SetupView {
  'FETCH',
  'FETCH_COMPLETE',
  'VALIDATE',
  'VALIDATE_COMPLETE',
  'FAILED',
  'ACCOUNT_FORM',
  'PHONE_NUMBER_FORM',
}

export interface PhoneNumber {
  friendlyName: string;
  phoneNumber: string;
}

export interface ValidationResult {
  text: string;
  isValid: boolean;
}

export interface SetupStore {
  view: SetupView;
  error: Error | undefined;
  configuration: {
    twilio: {
      accountSid: string | undefined;
      key: string | undefined;
      secret: string | undefined;
      inbound: {
        isEnabled: boolean;
        phoneNumber: string | undefined;
      };
      outbound: {
        isEnabled: boolean;
        mode: 'internal-caller-id' | 'external-caller-id';
        phoneNumber: string | undefined;
      };
    };
    microsoft: {
      connectionString: string | undefined;
    };
  };
  callerIds: Array<PhoneNumber>;
  phoneNumbers: Array<PhoneNumber>;
  validation: {
    local: ValidationResult;
    remote: ValidationResult;
  };
  isSaving: boolean;
}
