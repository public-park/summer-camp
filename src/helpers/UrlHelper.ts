const stripLeadingSlash = (value: string): string => {
  return value.startsWith('/') ? value.substr(1, value.length) : value;
};

const stripTrailingSlash = (value: string): string => {
  return value.endsWith('/') ? value.substr(0, value.length - 1) : value;
};

export const getBaseUrl = () => {
  return process.env.REACT_APP_SERVER_URL || window.location.host;
};

export const getUrl = (path: string): string => {
  const segment = stripLeadingSlash(path);
  const base = stripTrailingSlash(getBaseUrl());

  return `${window.location.protocol}//${[base, 'api', segment].join('/')}`;
};

export const getWebSocketUrl = (): string => {
  const url = process.env.REACT_APP_SERVER_URL || window.location.host;

  return window.location.protocol === 'https:' ? `wss://${url}` : `ws://${url}`;
};
