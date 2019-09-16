import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import LockIcon from '@material-ui/icons/Lock';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Stepper from './stepper'


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
          <Typography variant='h5' component="h2" color="textSecondary">
            Subscribe and Start Today ...
          </Typography>
        </DialogTitle>
        <Toolbar/>
        <Stepper/>
        <DialogActions>

        </DialogActions>
      </Dialog>
    </div>
  )
}
