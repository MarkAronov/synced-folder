import React from "react";
import { ProvideData } from './context/useInfo';

import ThemeEngine from './components/organisms/ThemeEngine';
/**
 * Main function
 * @return {JSX.Element} the app
 */
const App = (): JSX.Element => (
  <ProvideData>
    <ThemeEngine />
  </ProvideData>
);
export default App;
