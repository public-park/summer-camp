export const stripLeadingSlash = (value: string): string => {
  return value.startsWith('/') ? value.substr(1, value.length) : value;
};

export const stripTrailingSlash = (value: string): string => {
  return value.endsWith('/') ? value.substr(0, value.length - 1) : value;
};
