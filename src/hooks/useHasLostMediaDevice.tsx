export const useHasLostMediaDevice = (deviceId: string | undefined, devices: MediaDeviceInfo[] | undefined) => {
  if (!deviceId || !devices || devices.length === 0) {
    return false;
  }

  return !devices.find((device) => device.deviceId === deviceId);
};
