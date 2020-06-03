import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { blue } from '@material-ui/core/colors';

const ApplicationThemeProvider = (props: any) => {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
    },
  });

  return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
};

export default ApplicationThemeProvider;
