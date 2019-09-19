// This is used to determine if a user is authenticated and
// if they are allowed to visit the page they navigated to.

// If they are: they proceed to the page
// If not: they are redirected to the login page.
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import Firebase from './firebase';
import { withSnackbar , useSnackbar } from 'notistack';
import Typography from '@material-ui/core/Typography';
//JSON.parse ( sessionStorage.getItem ( 'User' ) )

function AuthedUser ( props ) {
  const [ user, setUser ] = React.useState( Firebase.auth().currentUser );
  const [ redirect, setRedirect ] = React.useState( false );
  const { enqueueSnackbar , } = useSnackbar();
  React.useEffect(() => {
    Firebase.auth().onAuthStateChanged ( user => {
      if ( user ){
        //sessionStorage.setItem ( 'User' , JSON.stringify ( user ) );
        enqueueSnackbar ( "Signed in as " + user.displayName , {
            variant : "info"  ,
            autoHideDuration: 2500,
        });
      }else {
        setRedirect ( true )
        setUser ( user )
        enqueueSnackbar ( "you have to log in first..." , {
            variant : "error"  ,
            autoHideDuration: 2500,
        });
      }
      setUser ( user )
    });
    return () => {
    };
  });
  return [ user , redirect ];
}

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { enqueueSnackbar , closeSnackbar } = useSnackbar();
  let key = React.useRef ()

  const user = AuthedUser();
  if ( ! user[ 0 ] ){
    key.current =
      enqueueSnackbar ( "waiting for FireBase" , {
        variant : "warning"  ,
        persist: true,
      })
  }else {
    closeSnackbar ( key.current );
  }
  if ( user[ 1 ] ){
    closeSnackbar ( key.current );
  }

  return (
    <Route
      {...rest}
      render={props =>
        user[ 0 ] ? (
          <Component {...props} />
        ) : (
          user[ 1 ] ? (
            <Redirect to={{ pathname: '/', state: { from: props.location } }} />
          ):(
            <Typography
              style={{
                background : `linear-gradient( rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4) ), url(static/pexels.jpeg)` ,
                height:'100vh',
                width:'100vw' ,
                backgroundSize: 'cover',
              }}
            />
          )
        )
      }
    />
  )
}

export default withSnackbar ( PrivateRoute );
