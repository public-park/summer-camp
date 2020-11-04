import React, { useContext, useState, MouseEvent, useEffect } from 'react';
import CardContent from '@material-ui/core/CardContent';
import { Button } from '@material-ui/core';
import { ApplicationContext } from '../../context/ApplicationContext';
import { create } from '../../helpers/api/RequestHelper';
import { getUrl } from '../../helpers/UrlHelper';
import { useRequest, RequestState } from '../../hooks/useRequest';
import {
  MAXIMUM_LENGTH_OF_USER_NAME,
  MAXIMUM_LENGTH_OF_USER_PASSWORD,
  MINIMUM_LENGTH_OF_USER_NAME,
  MINIMUM_LENGTH_OF_USER_PASSWORD,
} from '../../Constants';
import { RegisterFormInput } from './RegisterFormInput';
import Alert from '@material-ui/lab/Alert/Alert';
import { RequestException } from '../../exceptions/RequestException';

interface RegisterFormProps {
  isVisible: boolean;
}

export const RegisterForm = ({ isVisible }: RegisterFormProps) => {
  const { login } = useContext(ApplicationContext);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isPristine, setIsPristine] = useState(true);
  const [error, setError] = useState('');

  const { response, exception, state, setRequest } = useRequest();

  useEffect(() => {
    if (isValidName(name).isValid && isValidPassword(password).isValid) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [name, password]);

  useEffect(() => {
    if (!exception) {
      return;
    }

    setIsPristine(true);

    const response = (exception as RequestException).response;

    switch (response.status) {
      case 409:
        setError('user is already registered');
        break;
      case 400:
        setError(response.body.description);
        break;
      case 200:
        setError('');
        break;
      default:
        setError('unknown error');
        break;
    }
  }, [exception]);

  useEffect(() => {
    if (state === RequestState.Success && response) {
      login(response?.body.token);
    }
  }, [state, response, login]);

  const onFocus = () => {
    setIsPristine(false);
  };

  const isValidName = (value: string) => {
    if (value.length < MINIMUM_LENGTH_OF_USER_NAME) {
      return { isValid: false, text: 'Name is too short' };
    }

    if (value.length > MAXIMUM_LENGTH_OF_USER_NAME) {
      return { isValid: false, text: 'Name is too long' };
    }

    return { isValid: true, text: '' };
  };

  const isValidPassword = (value: string) => {
    if (value.length < MINIMUM_LENGTH_OF_USER_PASSWORD) {
      return { isValid: false, text: 'Password is too short' };
    }

    if (value.length > MAXIMUM_LENGTH_OF_USER_PASSWORD) {
      return { isValid: false, text: 'Password is too long' };
    }

    return { isValid: true, text: '' };
  };

  const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault();

    const url = getUrl('register');
    const payload = {
      name: name,
      password: password,
    };

    console.log(`register: ${name} via endpoint ${url}`);
    // TODO rename to initiateRequest
    setRequest(create(url).post(payload));
  };

  return (
    <div hidden={!isVisible}>
      <CardContent>
        <form className="register-form" noValidate autoComplete="off">
          <div>
            <RegisterFormInput
              id="name-register-input"
              label="Name"
              name="name"
              type="text"
              default={''}
              validator={isValidName}
              onUpdate={setName}
              onFocus={onFocus}
            />
          </div>
          <div>
            <RegisterFormInput
              id="password-register-input"
              label="Password"
              name="password"
              type="password"
              default={''}
              validator={isValidPassword}
              onUpdate={setPassword}
              onFocus={onFocus}
            />
          </div>
          <div>
            <Button
              fullWidth
              disabled={!isValid || state === 'InProgress'}
              onClick={(event) => handleSubmit(event)}
              variant="contained"
              color="primary"
              name="submit"
            >
              REGISTER
            </Button>
          </div>

          {isPristine && error && (
            <Alert className="register-error" style={{ marginTop: '10px' }} variant="filled" severity="error">
              {error}
            </Alert>
          )}
        </form>
      </CardContent>
    </div>
  );
};
