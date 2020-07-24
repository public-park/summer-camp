import { useEffect, useState } from 'react';

export const useLocalStorage = (key: string): [string | undefined, (value: string | undefined) => void] => {
  const [storedValue, setStoredValue] = useState<string | undefined>('');

  useEffect(() => {
    console.log(`read ${key} from local storage`);

    if (!window.localStorage) {
      console.log(`browser has no local storage object, cannot load persisted value`);
      return;
    }

    const value = window.localStorage.getItem(key);

    if (value) {
      setStoredValue(value);
    }
  }, []);

  const setValue = (value: string | undefined) => {
    if (!window.localStorage) {
      console.log(`browser has no local storage object, cannot persist value`);
      return;
    }

    if (value) {
      console.log(`persist ${key} with ${value}`);

      window.localStorage.setItem(key, value);

      setStoredValue(value);
    } else {
      console.log(`remove ${key} from local storage`);
      window.localStorage.removeItem(key);
    }
  };

  return [storedValue, setValue];
};
