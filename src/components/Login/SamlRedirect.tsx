import React, { MouseEvent } from 'react';
import { CardContent, Button } from '@material-ui/core';

export const SamlRedirect = () => {
  const handleRedirect = async (e: MouseEvent) => {
    window.location.href = `//${process.env.REACT_APP_SERVER_URL}/saml/${process.env.REACT_APP_SAML_ACCOUNT_ID}/authenticate`;

    e.preventDefault();
  };

  return (
    <div>
      <CardContent>
        <form style={{ paddingTop: '10px' }} noValidate autoComplete="off">
          <Button fullWidth onClick={handleRedirect} variant="contained" color="primary">
            Login with SSO
          </Button>
        </form>
      </CardContent>
    </div>
  );
};
