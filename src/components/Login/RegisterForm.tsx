import React, { useState, useContext } from 'react';
import CardContent from '@material-ui/core/CardContent';
import { FormControl, Button, OutlinedInput, InputLabel } from '@material-ui/core';
import { ApplicationContext } from '../../context/ApplicationContext';
import { request } from '../../helpers/api/RequestHelper';
import { getUrl } from '../../helpers/UrlHelper';

interface RegisterFormProps {
  isVisible: boolean;
}

interface RegisterFormValues {
  name: string;
  password: string;
}

export const RegisterForm = ({ isVisible }: RegisterFormProps) => {
  const { login } = useContext(ApplicationContext);

  const [values, setValues] = useState<RegisterFormValues>({
    name: '',
    password: '',
  });

  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name: string) => (event: any) => {
    console.log('handle change');
    setValues({ ...values, [name]: event.target.value });
  };

  const register = async () => {
    setIsFetching(true);

    try {
      const response = await request(getUrl('register')).post({
        name: values.name.trim(),
        password: values.password.trim(),
      });

      login(response.body.token);
    } catch (error) {
      switch (error.status) {
        case 409:
          setError('user is already registered');
          break;
        default:
          setError('unknown error');
          break;
      }
    } finally {
      setIsFetching(true);
    }
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
                style={{ marginBottom: '20px' }}
                disabled={isFetching}
                type="text"
                autoComplete="off"
                value={values.name}
                onChange={handleChange('name')}
                id="name-register-input"
                label="Name"
              />
            </FormControl>
          </div>

          <div>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
              <OutlinedInput
                style={{ marginBottom: '20px' }}
                fullWidth
                disabled={isFetching}
                type="password"
                autoComplete="off"
                value={values.password}
                onChange={handleChange('password')}
                id="password-register-input"
                label="Passwordd"
              />
            </FormControl>
          </div>
          <div>
            <Button fullWidth disabled={isFetching} onClick={register} variant="contained" color="primary">
              REGISTER
            </Button>
          </div>
          {error && <div>{error}</div>}
        </form>
      </CardContent>
    </div>
  );
};
