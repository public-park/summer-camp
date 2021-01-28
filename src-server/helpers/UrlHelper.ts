export const stripLeadingSlash = (value: string): string => {
  return value.startsWith('/') ? value.substr(1, value.length) : value;
};

export const stripTrailingSlash = (value: string): string => {
  return value.endsWith('/') ? value.substr(0, value.length - 1) : value;
};

export const getBaseUrl = () => {
  return process.env.PUBLIC_BASE_URL as string;
};

export const getPublicUrl = (path: string | undefined): string => {
  if (!path) {
    return getBaseUrl();
  }

  const segment = stripLeadingSlash(path);
  const base = stripTrailingSlash(getBaseUrl());

  return [base, segment].join('/');
};
