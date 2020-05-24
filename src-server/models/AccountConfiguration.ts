export interface AccountConfiguration {
  key: string | undefined;
  secret: string | undefined;
  accountSid: string | undefined;
  applicationSid: string | undefined;
  inbound: {
    isEnabled: boolean;
    phoneNumber: string | undefined;
  };
  outbound: {
    isEnabled: boolean;
    mode: string | undefined;
    phoneNumber: string | undefined;
  };
}
