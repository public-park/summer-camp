import { RequestException } from '../exceptions/RequestException';
import { RequestTimeoutException } from '../exceptions/RequestTimeoutException';
import { getUrl } from '../helpers/UrlHelper';
import { AccountConfiguration } from '../models/AccountConfiguration';
import { User } from '../models/User';
import { PhoneNumber } from '../store/SetupStore';

async function fetchWithTimeout(request: string, options: any): Promise<Response> {
  const { timeout = 8000 } = options;

  try {
    const controller = new AbortController();

    const id = setTimeout(() => {
      controller.abort();
    }, timeout);

    const response: Response = await fetch(request, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new RequestException(response, response.statusText);
    }

    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new RequestTimeoutException();
    } else {
      throw error;
    }
  }
}

const getHeaders = (method: 'POST' | 'GET') => {
  return {
    method: method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };
};

const getHeaderWithAuthentication = (method: 'POST' | 'GET', user: User) => {
  return {
    method: method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Token: user.connection.token,
    },
  };
};

const parseJson = async (response: Response) => {
  try {
    const body = await response.json();

    return body as object;
  } catch (error) {
    throw new RequestException(response, 'Invalid JSON document');
  }
};

interface UserTokenJson {
  token: string;
  userId: string;
  accountId: string;
}

const parseUserTokenJson = async (response: Response): Promise<UserTokenJson> => {
  const parsed = await parseJson(response);

  if (parsed.hasOwnProperty('token') && parsed.hasOwnProperty('accountId') && parsed.hasOwnProperty('userId')) {
    return parsed as UserTokenJson;
  } else {
    throw new RequestException(response, 'Invalid JSON document');
  }
};

interface IsValidUserTokenJson {
  isValid: boolean;
}

const parseIsValidUserTokenJson = async (response: Response): Promise<IsValidUserTokenJson> => {
  const parsed = await parseJson(response);

  if (parsed.hasOwnProperty('isValid')) {
    return parsed as IsValidUserTokenJson;
  } else {
    throw new RequestException(response, 'Invalid JSON document');
  }
};

interface PhoneTokenJson {
  token: string;
}

const parsePhoneTokenJson = async (response: Response): Promise<PhoneTokenJson> => {
  const parsed = await parseJson(response);

  if (parsed.hasOwnProperty('token')) {
    return parsed as PhoneTokenJson;
  } else {
    throw new RequestException(response, 'Invalid JSON document');
  }
};

interface AccountPhoneNumberJson {
  incomingPhoneNumbers: Array<PhoneNumber>;
  outgoingCallerIds: Array<PhoneNumber>;
}

const parseAccountPhoneNumberJson = async (response: Response): Promise<AccountPhoneNumberJson> => {
  const parsed = await parseJson(response);

  if (parsed.hasOwnProperty('outgoingCallerIds') && parsed.hasOwnProperty('incomingPhoneNumbers')) {
    return parsed as AccountPhoneNumberJson;
  } else {
    throw new RequestException(response, 'Invalid JSON document');
  }
};

interface AccountConfigurationValidateJson {
  isValid: boolean;
  text: string;
}

const loginUser = async (name: string, password: string): Promise<UserTokenJson> => {
  const url = getUrl('login');

  const response = await fetchWithTimeout(url, {
    ...getHeaders('POST'),
    body: JSON.stringify({
      name: name,
      password: password,
    }),
  });

  return await parseUserTokenJson(response);
};

const registerUser = async (name: string, password: string) => {
  const url = getUrl('register');

  const response = await fetchWithTimeout(url, {
    ...getHeaders('POST'),
    body: JSON.stringify({
      name: name,
      password: password,
    }),
  });

  return await parseUserTokenJson(response);
};

const validateUserToken = async (token: string): Promise<boolean> => {
  const url = getUrl('validate-token');

  const response = await fetchWithTimeout(url, {
    ...getHeaders('POST'),
    body: JSON.stringify({
      token: token,
    }),
  });

  const parsed = await parseIsValidUserTokenJson(response);

  return parsed.isValid;
};

const createPhoneToken = async (user: User): Promise<string> => {
  const url = getUrl(`users/${user.id}/phone/token`);

  const response = await fetchWithTimeout(url, getHeaderWithAuthentication('POST', user));

  const parsed = await parsePhoneTokenJson(response);

  return parsed.token;
};

const fetchAccountConfiguration = async (user: User): Promise<unknown> => {
  const url = getUrl(`/accounts/${user.accountId}/configuration`);

  const response = await fetchWithTimeout(url, getHeaderWithAuthentication('GET', user));

  const text = await response.text();

  if (text.length) {
    return JSON.parse(text);
  }

  // TODO check type
};

const updateAccountConfiguration = async (user: User, configuration: AccountConfiguration): Promise<void> => {
  const url = getUrl(`/accounts/${user.accountId}/configuration`);

  await fetchWithTimeout(url, {
    ...getHeaderWithAuthentication('POST', user),
    body: JSON.stringify(configuration),
  });
};

const validateAccountConfiguration = async (
  user: User,
  configuration: AccountConfiguration
): Promise<AccountConfigurationValidateJson> => {
  const url = getUrl(`/accounts/${user.accountId}/configuration/validate`);

  try {
    await fetchWithTimeout(url, {
      ...getHeaderWithAuthentication('POST', user),
      body: JSON.stringify(configuration),
    });

    return { isValid: true, text: '' };
  } catch (error) {
    return { isValid: false, text: error.response.body.description };
  }
};

const fetchAccountPhoneNumbers = async (user: User): Promise<AccountPhoneNumberJson> => {
  const url = getUrl(`/accounts/${user.accountId}/phone-numbers`);

  const response = await fetchWithTimeout(url, getHeaderWithAuthentication('GET', user));

  const parsed = await parseAccountPhoneNumberJson(response);

  return parsed;
};

const fetchCalls = async (user: User, skip: number, limit: number): Promise<any> => {
  const url = getUrl(`/calls?skip=${skip}&limit=${limit}`);

  const response = await fetchWithTimeout(url, getHeaderWithAuthentication('GET', user));

  const parsed = await parseJson(response);

  return parsed;
};

export {
  registerUser,
  loginUser,
  createPhoneToken,
  validateUserToken,
  fetchAccountConfiguration,
  updateAccountConfiguration,
  validateAccountConfiguration,
  fetchAccountPhoneNumbers,
  fetchCalls,
};
