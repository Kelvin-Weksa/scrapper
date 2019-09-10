import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CardMedia from '@material-ui/core/CardMedia';
import ListItemText from '@material-ui/core/ListItemText';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import clsx from 'clsx';
import Listing from './list'
import IconBreadcrumbs from './breadCrumb'
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import RestorePageIcon from '@material-ui/icons/RestorePage';
import ClearIcon from '@material-ui/icons/Clear';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import Tooltip from '@material-ui/core/Tooltip';
import { useSnackbar } from 'notistack';
import Card from '@material-ui/core/Card';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    //backgroundImage:`url(static/pexels.jpeg)`,
    boxShadow: `0 0 5px ${theme.palette.secondary.light}` ,
    marginLeft: drawerWidth,
    zIndex: theme.zIndex.drawer ,
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    justifyContent: 'center',
    boxShadow: `0 0 5px ${theme.palette.primary.light}`
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundImage:`url(static/pexels.jpeg)`,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  /*contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: -drawerWidth,
  },*/
  media: {
    height: 30,
    width: 40,
    transform:'scale(0.3,0.4)'
  },
  sticky:{
    position : 'sticky' ,
    top : 0 ,
    zIndex: theme.zIndex.appBar ,

  },
  logo: {
    height: 40,
    width: 80,
    //transform:'scale(0.3,0.4)'
  },
  light: {
    backgroundColor: fade(theme.palette.secondary.main, 0.25),
  },
  rightIcon: {
    //margin: 'auto'
  },
  button: {
    margin: theme.spacing(1),
  },
  margin: {
    display: 'flex' ,
    justifyContent: 'center' ,
  } ,
  info: {
    display: 'flex' ,
    justifyContent: 'center' ,
    width : theme.mixins.toolbar.minHeight,
    height: theme.mixins.toolbar.minHeight,
    "&:hover": {
      boxShadow: `0 0 11px ${theme.palette.primary.main}`
    }
  },
}));

function DetectBottom() {
  const [bottomYet, setBottom] = React.useState ( false );

  React.useEffect(() => {
    const handleScroll = () => {
      if ( ( window.innerHeight + window.scrollY ) >= document.body.offsetHeight ) {
        // you're at the bottom of the page
        setBottom ( true )
      }else{
        setBottom ( false )
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  return bottomYet;
}

function MyResponsiveComponent() {
  const scroll = DetectBottom(); // Our custom Hook
  return (
    <p>{scroll ? 'bottomYet' :'' }</p>
  );
}

function ResponsiveDrawer ( props ) {
  const { container } = props;
  const classes = useStyles();
  const theme = useTheme();
  const { enqueueSnackbar , closeSnackbar } = useSnackbar();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [ filter , setFilter ] = React.useState ( "PE" );

  function handleDrawerToggle() {
    setMobileOpen(!mobileOpen);
  }

  function handleDrawerClose ( ) {
    setMobileOpen ( false );
  }

  function loadData ( page , get , logo ) {// eslint-disable-next-line
    props .fetcher ( page , get , logo );
    handleDrawerClose ();
  }

  function toggleFilter ( ) {
    if ( filter === "PE" ){
      setFilter ( "VC" );
    }else if ( filter === "VC" ){
      setFilter ( "PE" );
    }
    if ( drawer.current ){
      var topPos = drawer.current.offsetTop;
      console.log ( "i have to scroll! " + topPos )
      drawer.current.scrollTop = 0;
    }
  }

  function handleRefresh ( ) {
    // variant could be success, error, warning, info, or default
    const action = ( key ) => (
      <React.Fragment>
        <Tooltip title="Proceed">
          <IconButton color="primary" onClick={props.refresh}>
            <DoneAllIcon/>
          </IconButton>
        </Tooltip>

        <Tooltip title="Dismiss">
          <IconButton color="secondary" onClick={() => { closeSnackbar(key) }}>
            <ClearIcon/>
          </IconButton>
        </Tooltip>
      </React.Fragment>
    );

    enqueueSnackbar ( "This Operation Will Diminish System Perfomance" , {
        action ,
        variant : "warning"  ,
        autoHideDuration: 2500,
    });

  };

  const drawer = (
    <div>
    <div className={classes.sticky} >
      <div className={classes.drawerHeader}>
        <IconBreadcrumbs toggle={toggleFilter} />
        <Hidden smUp implementation="css">
          <IconButton color="secondary" onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Hidden>
      </div>
      <Divider light={true} className={classes.light}/>
    </div>
      <Divider />
      <List>{/* eslint-disable-next-line*/}
        {Listing .filter ( item => item .includes ( filter ) ) .map ( (list , index ) => (// eslint-disable-next-line
          <ListItem button key={index} onClick={( ) => loadData ( list [ 2 ] , list [ 1 ] , list [ 3 ] )} title={list [ 0 ]}>
              <CardMedia
                className={classes.media}
                image={list[ 3 ]}
              />{/* eslint-disable-next-line*/}
            <ListItemText primary={list [ 2 ]} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <CardMedia
            className={classes.logo}
            image={props.logo}
            component='img'
          />{/* eslint-disable-next-line*/}
          <Divider orientation="vertical" className={classes.light}/>
          <Typography variant="h6" noWrap>
            {props.sitePage}
          </Typography>
          <Divider orientation="vertical" color="secondary"/>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: mobileOpen,
        })}
      >
        <Toolbar style={{height: theme.mixins.toolbar/2}}/>
        <Typography className={classes.margin}>
          <Typography style={{padding:'12px'}} variant="h5" component="h2" >
            {props.stale ? props.stale : ''}
          </Typography>
          <Card className={classes.info}>
            <Tooltip title="Refresh" placement="right">
              <IconButton color="secondary" onClick={handleRefresh} className={classes.rightIcon}>
                <RestorePageIcon  />
              </IconButton>
            </Tooltip>
          </Card>
        </Typography>
        <Toolbar style={{height: theme.mixins.toolbar/2}}/>
        {props.content}
        <MyResponsiveComponent/>
      </main>
    </div>
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  container: PropTypes.instanceOf(typeof Element === 'undefined' ? Object : Element),
};

export default ResponsiveDrawer;
