export interface UserConfigurationDocument {
  phone: {
    constraints: {
      echoCancellation: boolean;
      autoGainControl: boolean;
      noiseSuppression: boolean;
    };
  };
}
