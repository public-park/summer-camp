import { PhoneDirection } from '../../types';

export interface PhoneConfigurationDocument {
  direction: PhoneDirection;
  callerIds: Array<string>;
  constraints: {
    echoCancellation: boolean;
    autoGainControl: boolean;
    noiseSuppression: boolean;
  };
}
