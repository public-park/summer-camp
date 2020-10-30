import React, { MouseEvent, useState, useContext, useEffect } from 'react';
import {
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { ApplicationContext } from '../../context/ApplicationContext';
import { create } from '../../helpers/api/RequestHelper';
import { getUrl } from '../../helpers/UrlHelper';
import { useRequest } from '../../hooks/useRequest';
import { LoadIndicator } from '../Workspace/ConfigurationView/LoadIndicator';
import { RequestTimeoutException } from '../../exceptions/RequestTimeoutException';
import { RequestException } from '../../exceptions/RequestException';

interface LoginFormProps {
  isVisible: boolean;
}

interface LoginFormValues {
  name: string;
  password: string;
  showPassword: boolean;
  isEmpty: boolean;
}

export const LoginForm = ({ isVisible }: LoginFormProps) => {
  const { login } = useContext(ApplicationContext);
  const { response, exception, state, setRequest } = useRequest();

  const [values, setValues] = useState<LoginFormValues>({
    name: '',
    password: '',
    showPassword: false,
    isEmpty: false,
  });

  const handleShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault();

    const url = getUrl('login');
    const payload = {
      name: values.name,
      password: values.password,
    };

    console.log(`login: ${values.name} via endpoint ${url}`);

    setRequest(create(url).post(payload));
  };

  useEffect(() => {
    if (response) {
      login(response.body.token);
    }
  }, [response]);

  const handleChange = (name: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    setValues({
      ...values,
      [name]: event.target.value,
    });
  };

  useEffect(() => {
    setValues({
      ...values,
      isEmpty: values.password.length === 0 || values.name.length === 0,
    });
  }, [values.name, values.password]);

  return (
    <div hidden={!isVisible}>
      <CardContent>
        <form style={{ paddingTop: '10px' }} noValidate autoComplete="off">
          <div>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">Name</InputLabel>
              <OutlinedInput
                disabled={state === 'InProgress'}
                fullWidth
                type="text"
                style={{ marginBottom: '20px' }}
                autoComplete="on"
                value={values.name}
                onChange={handleChange('name')}
                id="name-login-input"
                label="Name"
              />
            </FormControl>
          </div>

          <div>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
              <OutlinedInput
                disabled={state === 'InProgress'}
                style={{ marginBottom: '20px' }}
                id="password-login-input"
                type={values.showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={handleChange('password')}
                autoComplete="on"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={handleShowPassword} edge="end">
                      {values.showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                labelWidth={70}
              />
            </FormControl>
          </div>
          <div>
            <Button
              disabled={state === 'InProgress' || values.isEmpty}
              fullWidth
              onClick={handleSubmit}
              variant="contained"
              color="primary"
            >
              GO
            </Button>
          </div>
        </form>
        {exception instanceof RequestException && <Typography style={{ marginTop: '5px' }}>Login failed</Typography>}
        {exception instanceof RequestTimeoutException && (
          <Typography style={{ marginTop: '5px' }}>Server did not respond, check your internet connection</Typography>
        )}
        {state === 'InProgress' && <LoadIndicator />}
      </CardContent>
    </div>
  );
};
