const addLeadingZero = (value: number) => {
  if (value < 10) {
    return '0' + value;
  }

  return value;
};

export const useCallDuration = (value: number) => {
  let duration: string = '';

  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value - hours * 3600) / 60);
  const seconds = value - hours * 3600 - minutes * 60;

  // call was less then a minute
  if (hours === 0 && minutes === 0) {
    duration = '00:' + addLeadingZero(seconds);
  }

  // call was less then an hour
  if (hours === 0 && minutes !== 0) {
    duration = addLeadingZero(minutes) + ':' + addLeadingZero(seconds);
  }

  if (hours === 1) {
    duration = hours + ':' + addLeadingZero(minutes);
  }

  if (hours > 1) {
    duration = hours + ':' + addLeadingZero(minutes);
  }

  return duration;
};
