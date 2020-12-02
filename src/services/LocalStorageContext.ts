export interface LocalStorageContext {
  token?: string;
  input?: string;
  output?: string;
}

const setValue = (key: string, value: string | undefined) => {
  if (value) {
    console.log(`persist ${key} with ${value}`);

    window.localStorage.setItem(key, value);
  } else {
    console.log(`remove ${key} from local storage`);
    window.localStorage.removeItem(key);
  }
};

const getValue = (key: string) => {
  const value = window.localStorage.getItem(key);

  if (value !== null) {
    return value;
  }
};

export const setContextOnLocalStorage = (context: LocalStorageContext) => {
  if (!window.localStorage) {
    console.log(`browser has no local storage object, cannot persist value`);
    return;
  }

  setValue('token', context.token);
  setValue('audio-input-device-id', context.input);
  setValue('audio-output-device-id', context.output);
};

export const getContextFromLocalStorage = () => {
  const context: LocalStorageContext = {};

  if (!window.localStorage) {
    console.log(`browser has no local storage object, cannot load persisted value`);
    return context;
  }

  context.token = getValue('token');
  context.input = getValue('audio-input-device-id');
  context.output = getValue('audio-output-device-id');

  return context;
};
