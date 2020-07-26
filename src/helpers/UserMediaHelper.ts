export const requestUserMedia = (): Promise<MediaStream | void> => {
  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => devices.every((device) => !(device.deviceId && device.label)))
    .then((shouldRequestPermissions) => {
      if (shouldRequestPermissions) {
        return navigator.mediaDevices
          .getUserMedia({ audio: true, video: false })
          .then((mediaStream) => mediaStream.getTracks().forEach((track) => track.stop()));
      }
    });
};
