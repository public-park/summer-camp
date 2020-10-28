import React from 'react';
import ReactDOM from 'react-dom';
import '@material/react-icon-button/dist/icon-button.css';
import 'typeface-roboto';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Page } from './Page';
import ApplicationThemeProvider from './ApplicationThemeProvider';
import { ApplicationContextProvider } from './ApplicationContextProvider';
import setup from './reducers/SetupReducer';
import application from './reducers/ApplicationReducer';
import { enableMapSet } from 'immer';

enableMapSet();

const reducer = combineReducers({
  application: application,
  setup: setup,
});

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
