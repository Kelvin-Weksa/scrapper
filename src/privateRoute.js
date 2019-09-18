// This is used to determine if a user is authenticated and
// if they are allowed to visit the page they navigated to.

// If they are: they proceed to the page
// If not: they are redirected to the login page.
import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import Firebase from './firebase'
import { withSnackbar , useSnackbar } from 'notistack';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { enqueueSnackbar , } = useSnackbar();
  const isLogged = Firebase.auth().currentUser

  if ( ! isLogged ){
    enqueueSnackbar ( "you have to log in first..." , {
        variant : "error"  ,
        autoHideDuration: 2500,
    });
  }

  return (
    <Route
      {...rest}
      render={props =>
        isLogged ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/', state: { from: props.location } }} />
        )
      }
    />
  )
}

export default withSnackbar ( PrivateRoute );
