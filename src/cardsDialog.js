import React from 'react';
import Button from '@material-ui/core/Button';
import LockIcon from '@material-ui/icons/Lock';
import { makeStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom'


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

function AlertDialog ( props ) {
  const classes = useStyles ( );

  return (
    <div className={classes.unlock}>
      <Button
        variant="contained"
        color="secondary"
        onClick={()=>{props.history.push ( '/pricing' )}}
        style={{margin:'auto'}}
      >
        <LockIcon />
        Trial Expired
      </Button>
    </div>
  )
}

export default withRouter ( AlertDialog )
