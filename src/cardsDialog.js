import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import LockIcon from '@material-ui/icons/Lock';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import PersonIcon from '@material-ui/icons/Person';
import PeopleIcon from '@material-ui/icons/People';
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';

const useStyles = makeStyles(theme => ({
  card: {
    width: 190,
    overflow: 'visible',
    transition : "all 300ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    "&:hover": {
      transform: `scale(1.1)` ,
      boxShadow: `0 0 11px ` ,
    },
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  info: {
    display: 'flex' ,
    justifyContent: 'center' ,
    width : theme.mixins.toolbar.minHeight * 0.9,
    height: theme.mixins.toolbar.minHeight * 0.9,
    position: 'relative' ,
    top: '-4vh',
    left: '5vh',
    border: `1px solid ${theme.palette.secondary.main}` ,
    borderRadius: '2px',

  },
  unlock:{
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: ' flex',
    },
  }
}));

function SimpleCard ( props ) {
  const classes = useStyles();

  return (
    <Grid item >
    <Button style={{textAlign:'left'}}>
    <Card className={classes.card} style={{backgroundColor:props.shade}}>
      <Card className={classes.info}>
        <Tooltip title="Refresh" placement="right">
          <IconButton color="secondary" className={classes.rightIcon}>
            {props.icon}
          </IconButton>
        </Tooltip>
      </Card>
      <CardContent style={{position:'relative',top:'-3vh'}}>
        <Typography variant='subtitle2'>
          {props.type}
        </Typography>
        <div style={{display:"inline-block"}}>
          <Typography variant="h4" component="h2" style={{float:'left'}}>
            <AttachMoneyIcon/>{props.value}
          </Typography>
          <Typography variant="overline" style={{float:'left'}}>
            Month
          </Typography>
        </div>
        <Typography color="textSecondary">
          {props.user}
        </Typography>
        <hr/>
        <Typography variant="caption" component="p" color="textSecondary">
          analytics Dashboard
        </Typography>
        <Typography variant="caption" component="p" color="textSecondary">
          email Alerts
        </Typography>
        <Typography variant="caption" component="p" color="textSecondary">
          social Media Activity
        </Typography>
      </CardContent>
    </Card>
    </Button>
    </Grid>
  );
}

export default function AlertDialog() {
  const classes = useStyles ( );
  const [ open , setOpen ] = React.useState ( false );

  function handleClickOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <div className={classes.unlock}>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleClickOpen}
      >
        <LockIcon />
        Trial Expired
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth='md'
        fullWidth={true}
      >
        <DialogTitle id="alert-dialog-title" style={{margin:'auto'}}>
          <Typography variant='h4' component="h2" color="textSecondary">
            Subscribe and Start Today ...
          </Typography>
        </DialogTitle>
        <Toolbar/>
        <Grid container spacing={3} justify="center">
          <SimpleCard
            icon={<PersonIcon/>}
            type={'10 Companies'}
            value={5}
            user={'Max 1 User'}
            shade={'#448aff'}
          />
          <SimpleCard
            icon={<PeopleIcon/>}
            type={'50 Companies'}
            value={50}
            user={'Max 5 Users'}
            shade={'#6a1b9a'}
          />
          <SimpleCard
            icon={<BusinessCenterIcon/>}
            type={'Enterprise Package'}
            value={500}
            user={'Max 1 Company'}
            shade={'#00c853'}
          />
        </Grid>
        <DialogActions>

        </DialogActions>
      </Dialog>
    </div>
  )
}
