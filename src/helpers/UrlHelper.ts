export const stripLeadingSlash = (value: string): string => {
  return value.startsWith('/') ? value.substr(1, value.length) : value;
};

export const stripTrailingSlash = (value: string): string => {
  return value.endsWith('/') ? value.substr(0, value.length - 1) : value;
};

export const getBaseUrl = () => {
  return process.env.REACT_APP_SERVER_URL || window.location.host;
};

export const getUrl = (path?: string): string => {
  if (!path) {
    return getBaseUrl();
  }

  const segment = stripLeadingSlash(path);
  const base = stripTrailingSlash(getBaseUrl());

  return `${window.location.protocol}//${[base, segment].join('/')}`;
};

export const getWebSocketUrl = (): string => {
  const url = process.env.REACT_APP_SERVER_URL || window.location.host;

  return window.location.protocol === 'https:'
    ? `wss://${stripTrailingSlash(url)}/socket`
    : `ws://${stripTrailingSlash(url)}/socket`;
};
