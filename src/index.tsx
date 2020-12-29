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
import user from './reducers/UserReducer';
import phone from './reducers/PhoneReducer';
import { enableMapSet } from 'immer';
import { ActionType, ApplicationAction } from './actions/Action';

enableMapSet();

const reducer = combineReducers({
  application: application,
  setup: setup,
  user: user,
  phone: phone,
});

export const root = (state: any, action: ApplicationAction) => {
  if (action.type === ActionType.APPLICATON_LOGOUT) {
    state = undefined;
  }

  return reducer(state, action as any);
};

const store = createStore(root, applyMiddleware(logger));

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
