import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconBreadcrumbs from './breadCrumb'
import Listing from './list'
import CardMedia from '@material-ui/core/CardMedia';
import { fade } from '@material-ui/core/styles/colorManipulator';

//import Image from

const drawerWidth = 265;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(1),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    position:"relative",
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundImage:`url(static/pexels.jpeg)`,
    paddingLeft : 0 ,
    //overflow: 'hidden'
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  media: {
    height: 30,
    width: 40,
    transform:'scale(0.3,0.4)'
  },
  logo: {
    height: 40,
    width: 80,
    //transform:'scale(0.3,0.4)'
  },
  light: {
    backgroundColor: fade(theme.palette.secondary.main, 0.25),
  },
  sticky:{
    position : 'sticky' ,
    top : 0 ,
    zIndex: theme.zIndex.appBar ,

  },
}));

export default function PersistentDrawerLeft ( props ) {
  const classes = useStyles ( );
  const theme = useTheme ( );// eslint-disable-next-line
  const [ open , setOpen ] = React .useState ( false );// eslint-disable-next-line
  const [ filter , setFilter ] = React .useState ( "PE" );
  const drawer = React.createRef ( );

  function handleDrawerOpen ( ) {
    setOpen ( true );
  }

  function handleDrawerClose ( ) {
    setOpen ( false );
  }

  function loadData ( page , get , logo ) {// eslint-disable-next-line
    props .fetcher ( page , get , logo );
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

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
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
        </Toolbar>
      </AppBar>
      <Drawer
        ref={drawer}
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.sticky} >
          <div className={classes.drawerHeader}>
            <IconBreadcrumbs toggle={toggleFilter} />
            <IconButton color="secondary" onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </div>
          <Divider light={true} className={classes.light}/>
        </div>
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
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        {props.content}
      </main>
    </div>
  );
}
