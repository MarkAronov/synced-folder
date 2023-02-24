import React, { useMemo } from 'react';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, useMediaQuery } from '@mui/material';

import FrontPage from './FrontPage';

/**
 * Theming function, here we use our own presets for the app
 * @return {JSX.Element} the app
 */
const ThemeEngine = (): JSX.Element => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', {
    noSsr: true,
  });

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FrontPage />
    </ThemeProvider>
  );
};

export default ThemeEngine;
