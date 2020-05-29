import React, { MouseEvent, useState, useContext } from 'react';
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
import { request } from '../../helpers/api/RequestHelper';
import { getUrl } from '../../helpers/UrlHelper';

interface LoginProps {
  isVisible: boolean;
}

interface LoginForm {
  name: string;
  password: string;
  showPassword: boolean;
}

export const LoginView = ({ isVisible }: LoginProps) => {
  const { login } = useContext(ApplicationContext);

  const [hasError, setHasError] = useState(false);
  const [, setIsFetching] = useState(false);

  const [values, setValues] = useState<LoginForm>({
    name: '',
    password: '',
    showPassword: false,
  });

  const handleShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault();

    setIsFetching(true);
    setHasError(false);

    console.log(`login:  ${values.name} via endpoint ${getUrl('login')}`);

    try {
      const response = await request(getUrl('login')).post({
        name: values.name,
        password: values.password,
      });

      login(response.body.token);
    } catch (error) {
      console.log(error);
      // TODO show error type to user
      setHasError(true);
    } finally {
      setIsFetching(true);
    }
  };

  const handleChange = (name: string) => (event: any) => {
    setValues({ ...values, [name]: event.target.value });
  };

  return (
    <div hidden={!isVisible}>
      <CardContent>
        <form style={{ paddingTop: '10px' }} noValidate autoComplete="off">
          <div>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">Name</InputLabel>
              <OutlinedInput
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
            <Button fullWidth onClick={handleSubmit} variant="contained" color="primary">
              GO
            </Button>
          </div>
        </form>
        {hasError && <Typography>Login failed</Typography>}
      </CardContent>
    </div>
  );
};
