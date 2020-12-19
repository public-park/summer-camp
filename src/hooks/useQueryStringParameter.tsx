import { useEffect, useState } from 'react';

export const useQueryStringParameter = (key: string) => {
  const [value, setValue] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.has(key)) {
      console.log(`found ${params.get(key)} on query string`);

      setValue(params.get(key) ?? undefined);
    }
  }, []);

  return value;
};
