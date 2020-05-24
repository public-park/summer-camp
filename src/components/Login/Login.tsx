import React, { MouseEvent, useState, useContext, useEffect } from 'react';

import { Link } from 'react-router-dom';

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
import { Context } from '../../context/ApplicationContext';
import { request } from '../../helpers/api/RequestHelper';
import { getUrl } from '../../helpers/UrlHelper';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/Store';
import { UserConnectionState } from '../../models/enums/UserConnectionState';
import { version } from '../../../package.json';

export const Login = () => {
  const { logout } = useContext(Context);

  const user = useSelector(selectUser);

  useEffect(() => {
    if (user.connection.state === UserConnectionState.Open) {
      logout();
    }
  }, []);

  const [showPassword, setShowPassword] = React.useState(false);

  const { login } = useContext(Context);

  const [hasError, setHasError] = useState(false);

  const [values, setValues] = useState({
    name: '',
    password: '',
    showPassword: false,
  });

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault();

    setHasError(false);

    console.log('login: ' + values.name + ' via endpoint ' + getUrl('login'));

    try {
      const response = await request(getUrl('login')).post({
        name: values.name,
        password: values.password,
      });

      login(response.body.token);
    } catch (error) {
      console.log(error);
      // TODO show error to user
      setHasError(true);
    }
  };

  const handleChange = (name: string) => (event: any) => {
    console.log(values);
    setValues({ ...values, [name]: event.target.value });
  };

  return (
    <div className="page-body">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>

        <form style={{ paddingTop: '10px' }} noValidate autoComplete="off">
          <div className="login">
            <div>
              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">Name</InputLabel>
                <OutlinedInput
                  fullWidth
                  type="text"
                  autoComplete="on"
                  value={values.name}
                  onChange={handleChange('name')}
                  id="standard-basic-2"
                  label="Name"
                />
              </FormControl>
            </div>

            <div>
              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPassword ? 'text' : 'password'}
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
          </div>
        </form>
        {hasError && <Typography>Login failed</Typography>}

        <div style={{ marginTop: '25px' }}>
          <Link to="/register">Create user {process.env.REACT_APP_API_URL}</Link>
        </div>

        <span style={{ fontSize: '0.8em', paddingTop: '25px', display: 'block' }}>summer camp {version}</span>
      </CardContent>
    </div>
  );
};
