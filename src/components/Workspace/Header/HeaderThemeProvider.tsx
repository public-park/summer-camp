import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';

export const HeaderThemeProvider = (props: any) => {
  const headerTheme = createMuiTheme({
    palette: {
      secondary: {
        main: '#fff',
      },
    },
  });

  return <ThemeProvider theme={headerTheme}>{props.children}</ThemeProvider>;
};
