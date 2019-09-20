import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles , } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
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
    backgroundColor: theme.palette.secondary.main
  },
}));


export default React.forwardRef( function SimpleCard ( props , ref ) {
  const classes = useStyles();

  function clicked ( ){
    props.onClick ( )
  }

  return (
    <Grid item >
    <Button style={{textAlign:'left'}} onClick={clicked} ref={ref}>
    <Card  className={classes.card} style={{backgroundColor:props.shade}}>
      <Card  className={classes.info}>
        <Tooltip title="Refresh" placement="right">
          <IconButton  className={classes.rightIcon}>
            {props.icon}
          </IconButton>
        </Tooltip>
      </Card>
      <CardContent style={{position:'relative',top:'-3vh'}}>
        <Typography variant='subtitle2'>
          {props.type}
        </Typography>
        <div style={{display:"inline-block"}}>
          <Typography variant="h4" component="h2" style={{float:'left',padding:0}}>
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
)
//export default function React.forwardRef ( ( props , ref ) =>  ( SimpleCard ))
