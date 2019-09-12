import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter , Switch , Route } from "react-router-dom";
//import { BrowserRouter , Route, Link } from "react-router-dom";
import LoginPage from './login'

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/dashboard" component={App} />
      <Route exact path="/" component={LoginPage} />
    </Switch>
  </BrowserRouter>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
