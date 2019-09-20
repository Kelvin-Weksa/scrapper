import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
//import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import DashboardIcon from '@material-ui/icons/Dashboard';
import { withRouter , } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import Button from '@material-ui/core/Button';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Badge from '@material-ui/core/Badge';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
  },
  grow: {
    flexGrow: 1,
  },
  appBar: {
    boxShadow: `0 0 5px ${theme.palette.secondary.light}` ,
  },
  button:{
    margin: 'auto',
    width: '100%',
    height: '10vh'
  }
}));

function PaperSheet ( props ) {
  const classes = useStyles();

  return (
    <div>
    <AppBar className={classes.appBar}>
      <Toolbar>
        <div className={classes.grow} />
        <Tooltip title="Dashboard">
          <IconButton edge="start" aria-label="close">
            <DashboardIcon onClick={()=>props.history.push( '/dashboard' )} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Account">
          <IconButton onClick={()=>props.history.push ( '/account' )} color="secondary">
            <Badge badgeContent={1} color="secondary">
              <AccountCircle />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Pricing">
          <IconButton edge="start" aria-label="close">
            <AddShoppingCartIcon onClick={()=>props.history.push( '/pricing' )} />
          </IconButton>
        </Tooltip>
        <Tooltip title="LogOut">
          <IconButton onClick={()=>props.history.push( '/' )}>
            <ExitToAppOutlinedIcon/>
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
    <div className={classes.root}>
      <Toolbar/>
      <Grid container spacing={3}>
        <Grid item xs={8}>
          <Paper style={{height:'75vh'}}/>
        </Grid>
        <Grid item xs={4}>
          <Grid container spacing={2} style={{display:'flex',flexDirection:'column',justifyContent:'space-around',height:'75vh'}}>
            <Grid item >
              <Paper style={{height:'50vh'}}/>
            </Grid>
            <Grid item >
              <Button variant="contained" color="secondary" className={classes.button} onClick={()=>{props.history.push ( '/pricing' )}}>
                Pricing
                <AddShoppingCartIcon className={classes.rightIcon} />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
    </div>
  );
}

export default withRouter ( PaperSheet )
