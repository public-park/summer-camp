import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Page } from '../../Page';

function Application() {
  return (
    <BrowserRouter>
      <Page />
    </BrowserRouter>
  );
}

export default Application;
