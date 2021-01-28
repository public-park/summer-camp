export interface UserConfiguration {
  phone: {
    constraints: {
      echoCancellation: boolean;
      autoGainControl: boolean;
      noiseSuppression: boolean;
    };
  };
}
