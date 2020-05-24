import React from 'react';
import { ContextContainer } from './components/ApplicationContainer/ApplicationContainer';
import { Switch, Route } from 'react-router-dom';
import { Login } from './components/Login/Login';
import { Register } from './components/Register/Register';
import { Workspace } from './components/Workspace/Workspace';
import { Offline } from './components/Offline/Offline';
import { NotFound } from './components/Error/Error';

export const Page = () => {
  return (
    <ContextContainer>
      <Switch>
        <Route path="/" exact component={Login} />
        <Route path="/register" exact component={Register} />
        <Route path="/workspace" component={Workspace} />
        <Route path="/offline" component={Offline} />
        <Route component={NotFound} />
      </Switch>
    </ContextContainer>
  );
};
