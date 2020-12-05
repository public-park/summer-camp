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
import { LoadIndicator } from '../Workspace/ConfigurationView/LoadIndicator';
import { RequestTimeoutException } from '../../exceptions/RequestTimeoutException';
import { RequestException } from '../../exceptions/RequestException';
import { loginUser } from '../../services/RequestService';

interface LoginFormProps {
  isVisible: boolean;
}

export const LoginForm = ({ isVisible }: LoginFormProps) => {
  const { login } = useContext(ApplicationContext);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault();

    if (isEmpty) {
      return;
    }

    console.log(`login: ${name}`);

    try {
      setIsFetching(true);

      const body = await loginUser(name, password);

      login(body.token);
    } catch (error) {
      setIsFetching(false);
      setError(error);
    }
  };

  useEffect(() => {
    setIsEmpty(password.length === 0 || name.length === 0);
  }, [name, password]);

  return (
    <div hidden={!isVisible}>
      <CardContent>
        <form className="login-form" noValidate autoComplete="off">
          <div>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">Name</InputLabel>
              <OutlinedInput
                disabled={isFetching}
                fullWidth
                type="text"
                style={{ marginBottom: '20px' }}
                autoComplete="on"
                value={name}
                onChange={(event) => setName(event.target.value)}
                name="name"
                label="Name"
              />
            </FormControl>
          </div>

          <div>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
              <OutlinedInput
                disabled={isFetching}
                style={{ marginBottom: '20px' }}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="on"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={handleShowPassword} edge="end">
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                labelWidth={70}
              />
            </FormControl>
          </div>
          <div>
            <Button
              disabled={isFetching}
              fullWidth
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              name="submit"
            >
              GO
            </Button>
          </div>
        </form>
        {error instanceof RequestException && (
          <Typography className="login-error" style={{ marginTop: '5px' }}>
            Login failed
          </Typography>
        )}
        {error instanceof RequestTimeoutException && (
          <Typography style={{ marginTop: '5px' }}>Server did not respond, check your internet connection</Typography>
        )}
        {isFetching && <LoadIndicator />}
      </CardContent>
    </div>
  );
};
