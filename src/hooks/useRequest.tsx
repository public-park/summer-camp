import { useState, useEffect } from 'react';
import { RequestException } from '../exceptions/RequestException';
import { RequestTimeoutException } from '../exceptions/RequestTimeoutException';

export enum RequestState {
  Init = 'Init',
  InProgress = 'InProgress',
  Success = 'Success',
  Failure = 'Failure',
}

export const useRequest = () => {
  const [request, setRequest] = useState<Promise<Response> | undefined>();
  const [response, setResponse] = useState<Response | undefined>();
  const [exception, setException] = useState<RequestException | RequestTimeoutException | undefined>();
  const [state, setState] = useState<RequestState>(RequestState.Init);

  useEffect(() => {
    const execute = async () => {
      setState(RequestState.InProgress);
      setException(undefined);
      setResponse(undefined);

      try {
        setResponse(await request);
        setState(RequestState.Success);
      } catch (error) {
        setState(RequestState.Failure);

        if (error.timeout) {
          setException(new RequestTimeoutException());
        } else {
          setException(new RequestException(error.response, error.message));
        }
      }
    };

    if (request) {
      execute();
    }
  }, [request]);

  return { response, exception, state, setRequest };
};
