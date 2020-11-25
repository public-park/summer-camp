export interface AccountConfigurationDocument {
  key?: string;
  secret?: string;
  accountSid?: string;
  inbound: {
    isEnabled: boolean;
    phoneNumber?: string;
  };
  outbound: {
    isEnabled: boolean;
    mode?: string;
    phoneNumber?: string;
  };
}
