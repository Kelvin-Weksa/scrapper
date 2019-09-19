import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter , Switch , Route } from "react-router-dom";
import { SnackbarProvider } from 'notistack';
import LoginPage from './login'
import PrivateRoute from './privateRoute'

ReactDOM.render(
  <SnackbarProvider maxSnack={2} preventDuplicate anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
    }}>
    <BrowserRouter>
      <Switch>
        <PrivateRoute exact path="/dashboard" component={App} />
        <Route exact path="/" component={LoginPage} />
      </Switch>
    </BrowserRouter>
  </SnackbarProvider>,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
