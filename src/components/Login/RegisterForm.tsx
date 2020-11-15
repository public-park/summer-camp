import React, { useContext, useState, MouseEvent, useEffect } from 'react';
import CardContent from '@material-ui/core/CardContent';
import { Button } from '@material-ui/core';
import { ApplicationContext } from '../../context/ApplicationContext';
import {
  MAXIMUM_LENGTH_OF_USER_NAME,
  MAXIMUM_LENGTH_OF_USER_PASSWORD,
  MINIMUM_LENGTH_OF_USER_NAME,
  MINIMUM_LENGTH_OF_USER_PASSWORD,
} from '../../Constants';
import { RegisterFormInput } from './RegisterFormInput';
import Alert from '@material-ui/lab/Alert/Alert';
import { registerUser } from '../../services/RequestService';

interface RegisterFormProps {
  isVisible: boolean;
}

export const RegisterForm = ({ isVisible }: RegisterFormProps) => {
  const { login } = useContext(ApplicationContext);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isPristine, setIsPristine] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isValidName(name).isValid && isValidPassword(password).isValid) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [name, password]);

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

    try {
      setIsFetching(true);

      const body = await registerUser(name, password);

      login(body.token);
    } catch (error: any) {
      setIsPristine(true);
      console.log(error);
      switch (error.response.status) {
        case 409:
          setError('user is already registered');
          break;
        case 400:
          setError(error.response.body.description);
          break;
        default:
          setError(error.message);
          break;
      }
    } finally {
      setIsFetching(false);
    }
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
              disabled={!isValid || isFetching}
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
