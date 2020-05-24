import React, { useState, useContext } from 'react';
import CardContent from '@material-ui/core/CardContent';
import { Typography, FormControl, TextField, Button } from '@material-ui/core';
import { Context } from '../../context/ApplicationContext';
import { request } from '../../helpers/api/RequestHelper';
import { getUrl } from '../../helpers/UrlHelper';


export const Register = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useContext(Context)

  const [isFetching] = useState(false);
  const [error, setError] = useState('')

  const register = async () => {

    setName(name.trim())
    setPassword(password.trim())

    try {

      const response =  await request(getUrl('register')).post({
        name, password
      })

      login(response.body.token)

    } catch (error) {

      switch (error.status) {
        case 409:
          setError('user is already registered')
          break;
        default:
          setError('unknown error')
          break;
      }
  
    }
  };

  return (
    <div>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Account Setup
        </Typography>

        <form style={{ paddingTop: '10px' }} noValidate autoComplete="off">
          
          <FormControl fullWidth>
            <TextField fullWidth
              style={{ marginBottom: '20px' }}
              disabled={isFetching}
              type="text"
              autoComplete="off"
              value={name ? name : ''}
              onChange={(event) => setName(event.target.value)}
              id="standard-basic-2"
              label="Name"
            />

            <TextField
              style={{ marginBottom: '20px' }}
              fullWidth
              disabled={isFetching}
              type="password"
              autoComplete="off"
              value={password ? password : ''}
              onChange={(event) => setPassword(event.target.value)}
              id="standard-basic-3"
              label="Password"
            />
          </FormControl>

          <Button fullWidth disabled={isFetching} onClick={register} variant="contained" color="primary">
            REGISTER
          </Button>

          {error && <div>{error}</div>}
        </form>
      </CardContent>
    </div>
  );
};
