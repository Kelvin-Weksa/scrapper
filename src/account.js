import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
//import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import DashboardIcon from '@material-ui/icons/Dashboard';
import { withRouter , } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import Button from '@material-ui/core/Button';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Badge from '@material-ui/core/Badge';
import CardMedia from '@material-ui/core/CardMedia';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    transition : "all 1000ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    opacity: 0,
    position: 'relative',
    top: '-7vh'
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
    height: '10vh',
    boxShadow: `0 0 4px`,
  },
  outer:{
    height:'75vh',
    overflow:'visible',
  },
  inner:{
    width: '90%',
    height: '15vh',
    position: 'relative',
    top: '-5vh',
    backgroundColor: theme.palette.primary.main,
    margin: 'auto',
    boxShadow: `0 0 4px`,
  },
  outer_card: {
    position : "relative" ,
    overflow:  "visible" ,
    textAlign:"center",
    height:'50vh',
  },
  inner_card: {
    position : "relative" ,
    borderRadius: "3px",
    margin:'auto',
    top: "-19vh",
    zIndex:`${theme.zIndex.mobileStepper + 1}` ,
    boxShadow: `0 0 11px ${theme.palette.primary.main}`,
    transform: `scale(0.7)` ,
  },
  typography:{
    color:'white',
    alignItems:'center',
    padding:'8px',
    ...theme.typography.h6,
    fontWeight:300,
    textAlign:'center',
  },
}));

function PaperSheet ( props ) {
  const classes = useStyles();
  let root = React.createRef();
  React.useEffect ( ( ) => {
    setTimeout( ()=> {
      root.current.style.top = '0vh';
      root.current.style.opacity = 1;
    }, 10);
  }, [root])

  return (
    <div>
      <Toolbar>
        <div className={classes.grow} />
        <Tooltip title="Dashboard">
          <IconButton>
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
          <IconButton>
            <AddShoppingCartIcon onClick={()=>props.history.push( '/pricing' )} />
          </IconButton>
        </Tooltip>
        <Tooltip title="LogOut">
          <IconButton onClick={()=>props.history.push( '/' )}>
            <ExitToAppOutlinedIcon/>
          </IconButton>
        </Tooltip>
      </Toolbar>
    <div className={classes.root} ref={root}>
      <Grid container spacing={3} style={{justifyContent:'flex-end'}}>
        <Grid item xs={8}>
          <Paper className={classes.outer}>
            <Paper className={classes.inner}>
              <Typography className={classes.typography}>
                Edit Profile
              </Typography>
            </Paper>
            <Grid container spacing={3}>
              <Grid item xs={6}>

              </Grid>
              <Grid item xs={6}>
                
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Grid container spacing={2} style={{display:'flex',flexDirection:'column',justifyContent:'flex-end',height:'75vh'}}>
            <Grid item >
              <Paper className={classes.outer_card}>
                <CardMedia
                  component='img'
                  alt="KW"
                  height="300"
                  image="static/person.png"
                  className={classes.inner_card}
                />
              </Paper>
            </Grid>
            <Grid item >
              <Button variant="contained" color="secondary" className={classes.button} onClick={()=>{props.history.push ( '/pricing' )}}>
                Subscription
                <AccountBalanceIcon className={classes.rightIcon} />
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
