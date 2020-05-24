import React from 'react';
import { ThemeProvider, createMuiTheme } from '@material-ui/core';
import { green, blue } from '@material-ui/core/colors';

export const PhoneConfigurationParent = (props: any) => {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      secondary: green,
    },
  });

  return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
};
