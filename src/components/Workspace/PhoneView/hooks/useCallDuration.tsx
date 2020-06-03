const addLeadingZero = (value: number) => {
  if (value < 10) {
    return `0${value}`;
  }

  return value;
};

export const useCallDuration = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration - hours * 3600) / 60);
  const seconds = duration - hours * 3600 - minutes * 60;

  if (hours === 0) {
    return `${addLeadingZero(minutes)}:${addLeadingZero(seconds)}`;
  } else {
    return `${hours}:${addLeadingZero(minutes)}:${addLeadingZero(seconds)}`;
  }
};
