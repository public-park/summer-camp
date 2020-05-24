import React from 'react';

import '@material/react-icon-button/dist/icon-button.css';
import 'typeface-roboto';
import { ExitSetupButton } from './ExitSetupButton';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { setView } from '../../../actions/ViewAction';

const outerTheme = createMuiTheme({
  palette: {
    secondary: {
      main: '#fff',
    },
  },
});

export const SetupHeader = (props: any) => {
  const dispatch = useDispatch();

  return (
    <div className="header">
      <ThemeProvider theme={outerTheme}>
        <ExitSetupButton color="secondary" onClick={() => dispatch(setView('PHONE'))} />
      </ThemeProvider>
    </div>
  );
};
