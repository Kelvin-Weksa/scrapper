// This is used to determine if a user is authenticated and
// if they are allowed to visit the page they navigated to.

// If they are: they proceed to the page
// If not: they are redirected to the login page.
import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import Firebase from './firebase'
import { withSnackbar , useSnackbar } from 'notistack';

function AuthedUser ( props ) {
  const [ user, setUser ] = React.useState( JSON.parse ( sessionStorage.getItem ( 'User' ) ) );
  const { enqueueSnackbar , } = useSnackbar();
  React.useEffect(() => {
    Firebase.auth().onAuthStateChanged ( user => {
      if ( user ){
        sessionStorage.setItem ( 'User' , JSON.stringify ( user ) );
        enqueueSnackbar ( user.displayName , {
            variant : "info"  ,
            autoHideDuration: 2500,
        });
      }else {
        sessionStorage.removeItem ( 'User' );
      }
      setUser ( user )
    });
    return () => {
    };
  });
  return user;
}


const PrivateRoute = ({ component: Component, ...rest }) => {
  const { enqueueSnackbar , } = useSnackbar();
  //const isLogged = Firebase.auth().currentUser
  const user = AuthedUser();
  if ( ! user ){
    enqueueSnackbar ( "you have to log in first..." , {
        variant : "error"  ,
        autoHideDuration: 2500,
    });
  }

  return (
    <Route
      {...rest}
      render={props =>
        user ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/', state: { from: props.location } }} />
        )
      }
    />
  )
}

export default withSnackbar ( PrivateRoute );
