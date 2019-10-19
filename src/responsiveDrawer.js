import React from 'react';
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
import IconBreadcrumbs from './breadCrumb'
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import RestorePageIcon from '@material-ui/icons/RestorePage';
import ClearIcon from '@material-ui/icons/Clear';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import Tooltip from '@material-ui/core/Tooltip';
import { useSnackbar } from 'notistack';
import Scroller from './scrollMain'
import Card from '@material-ui/core/Card';
import Subscription from './cardsDialog'
import { withRouter } from 'react-router-dom'
import Paper from '@material-ui/core/Paper';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import SectionDesktop from './sectionDesktop';
import Footer from './footer';

const drawerWidth = 230;

const useStyles = makeStyles(theme => ({
  '@global': {
    '*::-webkit-scrollbar': {
      width: '0.4em',
    },
    '*::-webkit-scrollbar-track': {
      boxShadow: `inset 0 0 3px ${theme.palette.secondary.light}` ,
      borderRadius: '10px'
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: `${theme.palette.primary.dark}`,
      borderRadius: '10px',
      "&:hover": {
        //transform: `scale(1.1)` ,
        backgroundColor: `${theme.palette.primary.light}`,
      }
    }
  },
  root: {
    display: 'flex',
    alignItems:'flex-end'
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
    zIndex: theme.zIndex.drawer ,
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
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
  info1:{
    position:'relative',
    margin:'auto',
    width:'60%',
    [theme.breakpoints.down('sm')]: {
      width:'90%',
    },
    textAlign:"center",
    "&:hover": {
      boxShadow: `0 0 11px ${theme.palette.primary.main}`
    },
  },
}));

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


  let Listed = props.permitted.sort((a,b) => (
    a[2].toUpperCase() > b[2].toUpperCase()) ? 1 :
      ((b[2].toUpperCase() > a[2].toUpperCase()) ? -1 : 0));

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
      <List>
        {Listed.length? (
          Listed.filter ( item => item.includes ( filter ) ).map ( (list , index ) => (
            <ListItem button key={index} onClick={( ) => loadData ( list[ list.length-1 ] , list[ 1 ] , list[ 3 ] )} title={list[ 0 ]}>
                <CardMedia
                  className={classes.media}
                  image={list[ 3 ]}
                />
              <ListItemText primary={list[ 2 ]} />
            </ListItem>
          ))
        ):(
          ! props.permissionsLoaded ?
          (
            <Paper className={classes.info1}>
              "...loading your data"
            </Paper>
          ) :(
              null
          )
        )}
      </List>
    </div>
  );
//
  return (
    <div style={{display:'flex',flexFlow:'column nowrap',minHeight:'100vh'}}>
      <div className={classes.root}>
        <CssBaseline />
        <div>
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
              />
              <Divider orientation="vertical" className={classes.light}/>
              <Typography variant="h6" noWrap>
                {props.sitePage}
              </Typography>
              <Divider orientation="vertical" color="secondary"/>
              <div className={classes.grow} />
              <SectionDesktop />
            </Toolbar>
          </AppBar>
        </div>
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
          style={{display:'flex',flexFlow:'column nowrap',width:'99%',}}
        >
          <Toolbar style={{height: theme.mixins.toolbar/2}}/>
          <div>
            {Listed.length?
              (<Typography className={classes.margin}>
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
              </Typography>):
              ! props.permissionsLoaded ?
              (<Typography className={classes.margin}>
                <Typography style={{padding:'12px'}} variant="h5" component="h2" >
                  ...loading data
                </Typography>
                <Card className={classes.info}>
                  <Tooltip title="...loading" placement="right">
                    <IconButton color="secondary" className={classes.rightIcon}>
                      <HourglassEmptyIcon  />
                    </IconButton>
                  </Tooltip>
                </Card>
              </Typography>) :
              (<Paper className={classes.info1}>
                Choose which companies to follow...
                <Subscription className={classes.info1}/>
              </Paper>
            )}
          </div>
          <Toolbar style={{height: theme.mixins.toolbar/2}}/>
          {props.content}
          {Listed.length? (
            <Scroller
              page={props.page}
              paginate={props.paginate}
            />
          ):(
            null
          )}
        </main>
      </div>
      <div style={{flex:`1 0 auto`}}/>
      <div className={classes.appBar} style={{flexFlow:'0 1 auto'}}>
        <Footer/>
      </div>
    </div>
  );
}

export default withRouter( ResponsiveDrawer );
