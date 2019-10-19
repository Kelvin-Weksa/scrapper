import React from 'react';
import { makeStyles, } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import DashboardIcon from '@material-ui/icons/Dashboard';
import Badge from '@material-ui/core/Badge';
import AccountCircle from '@material-ui/icons/AccountCircle';
import BuildIcon from '@material-ui/icons/Build';
import InfoIcon from '@material-ui/icons/Info';
import Firebase from './firebase';
import { useSnackbar } from 'notistack';
import MoreIcon from '@material-ui/icons/MoreVert';
import Toolbar from '@material-ui/core/Toolbar';

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
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

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

  function handleMobileMenuOpen(event) {
    setMobileMoreAnchorEl(event.currentTarget);
  }

  function handleMobileMenuClose() {
    setMobileMoreAnchorEl(null);
  }

  const mobileMenuId = 'primary-search-account-menu-mobile';

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={()=>{props.history.push( '/dashboard' );handleMobileMenuClose()}}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color={props.location.pathname === "/dashboard" ? "secondary" : ""}
        >
          <DashboardIcon />
        </IconButton>
        <p>Dashboard</p>
      </MenuItem>

      <MenuItem onClick={()=>{props.history.push( '/about' );handleMobileMenuClose()}}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color={props.location.pathname === "/about" ? "secondary" : ""}
        >
          <InfoIcon />
        </IconButton>
        <p>About</p>
      </MenuItem>

      <MenuItem onClick={()=>props.history.push ( '/account' )}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color={props.location.pathname === "/account" ? "secondary" : ""}
        >
          <Badge badgeContent={1} color="secondary">
            <AccountCircle />
          </Badge>
        </IconButton>
        <p>Account</p>
      </MenuItem>

      <MenuItem onClick={()=>{props.history.push( '/pricing' );handleMobileMenuClose()}}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color={props.location.pathname === "/pricing" ? "secondary" : ""}
        >
          <AddShoppingCartIcon />
        </IconButton>
        <p>Pricing</p>
      </MenuItem>

      {
        sessionStorage.getItem('isAdmin')==='true' ?
          (
            <MenuItem onClick={()=>{props.history.push( '/admin' );handleMobileMenuClose()}}>
              <IconButton
                aria-label="account of current user"
                aria-controls="primary-search-account-menu"
                aria-haspopup="true"
                color={props.location.pathname === "/admin" ? "secondary" : ""}
              >
                <BuildIcon />
              </IconButton>
              <p>Admin</p>
            </MenuItem>
          ):
          (null)
      }

      <MenuItem  onClick={handleLogout}>
        <IconButton color="inherit">
          <ExitToAppOutlinedIcon/>
        </IconButton>
        <p>LogOut</p>
      </MenuItem>
    </Menu>
  );

  return(
    <React.Fragment>
      <Toolbar>
        <div className={classes.sectionDesktop}>
          <Tooltip title="Dashboard">
            <IconButton color={props.location.pathname === "/dashboard" ? "secondary" : ""}>
              <DashboardIcon onClick={()=>props.history.push( '/dashboard' )} />
            </IconButton>
          </Tooltip>
          <Tooltip title="about">
            <IconButton color={props.location.pathname === "/about" ? "secondary" : ""}>
              <InfoIcon onClick={()=>props.history.push( '/about' )} />
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
          {
            sessionStorage.getItem('isAdmin')==='true' ?
              (
                <Tooltip title="Admin">
                  <IconButton color={props.location.pathname === "/admin" ? "secondary" : ""}>
                    <BuildIcon onClick={()=>props.history.push( '/admin' )} />
                  </IconButton>
                </Tooltip>
              ):
              (null)
          }
          <Tooltip title="LogOut">
            <IconButton onClick={handleLogout}>
              <ExitToAppOutlinedIcon/>
            </IconButton>
          </Tooltip>
        </div>
        <div className={classes.sectionMobile}>
          <IconButton
            aria-label="show more"
            aria-controls={mobileMenuId}
            aria-haspopup="true"
            onClick={handleMobileMenuOpen}
            color="inherit"
          >
            <MoreIcon />
          </IconButton>
        </div>
      </Toolbar>
      {renderMobileMenu}
    </React.Fragment>
  )
}

export default withRouter( AppIcons );
