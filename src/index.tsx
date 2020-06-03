import React from 'react';
import ReactDOM from 'react-dom';
import reducer from './reducers/RootReducer';
import '@material/react-icon-button/dist/icon-button.css';
import 'typeface-roboto';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import { Page } from './Page';
import ApplicationThemeProvider from './ApplicationThemeProvider';
import { ApplicationContextProvider } from './ApplicationContextProvider';

const store = createStore(reducer, applyMiddleware(logger));

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ApplicationThemeProvider>
        <ApplicationContextProvider>
          <Page />
        </ApplicationContextProvider>
      </ApplicationThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
