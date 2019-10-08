import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter , Switch , Route } from "react-router-dom";
import { SnackbarProvider } from 'notistack';
import LoginPage from './login';
import PrivateRoute from './privateRoute';
import Loader from './loader';
import Account from './account';
import Pricing from './pricing';
import Admin from './admin';
import './index.css';

ReactDOM.render(
  <SnackbarProvider maxSnack={2} preventDuplicate
    anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
    }}>
    <BrowserRouter>
      <Loader/>
      <Switch>
        <PrivateRoute exact path="/pricing" component={Pricing} />
        <PrivateRoute exact path="/account" component={Account}/>
        <PrivateRoute exact path="/dashboard" component={App}/>
        <PrivateRoute exact path="/admin" component={Admin}/>
        <Route exact path="/" component={LoginPage} />
      </Switch>
    </BrowserRouter>
  </SnackbarProvider>,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
