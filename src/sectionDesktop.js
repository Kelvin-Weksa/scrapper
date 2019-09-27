import React from 'react';
import { makeStyles, } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import DashboardIcon from '@material-ui/icons/Dashboard';
import Badge from '@material-ui/core/Badge';
import AccountCircle from '@material-ui/icons/AccountCircle';
import BuildIcon from '@material-ui/icons/Build';
import Firebase from './firebase';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  }));

function AppIcons (props){
  const classes = useStyles ( );
  //const theme = useTheme ( );
  const { enqueueSnackbar ,} = useSnackbar();

  React.useEffect ( () => {} )

  function handleLogout() {
    Firebase.auth().signOut().then( ()=> {
      enqueueSnackbar ( "Sign-out successful" , {
          variant : "info"  ,
          autoHideDuration: 2500,
      });
      //sessionStorage.removeItem ( 'User' );
    }).catch( error=> {
      enqueueSnackbar ( "An error happened" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      console.log(error);
    });
    props.history.push("/")
  }

  return(
    <React.Fragment>
      <div className={classes.sectionDesktop}>
        <Tooltip title="Dashboard">
          <IconButton color={props.location.pathname === "/dashboard" ? "secondary" : ""}>
            <DashboardIcon onClick={()=>props.history.push( '/dashboard' )} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Account">
          <IconButton color={props.location.pathname === "/account" ? "secondary" : ""}>
            <Badge badgeContent={1} color="secondary">
              <AccountCircle onClick={()=>props.history.push ( '/account' )}/>
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Pricing">
          <IconButton color={props.location.pathname === "/pricing" ? "secondary" : ""}>
            <AddShoppingCartIcon onClick={()=>props.history.push( '/pricing' )} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Admin">
          <IconButton color={props.location.pathname === "/admin" ? "secondary" : ""}>
            <BuildIcon onClick={()=>props.history.push( '/admin' )} />
          </IconButton>
        </Tooltip>
        <Tooltip title="LogOut">
          <IconButton onClick={handleLogout}>
            <ExitToAppOutlinedIcon/>
          </IconButton>
        </Tooltip>
      </div>
    </React.Fragment>
  )
}

export default withRouter( AppIcons );
