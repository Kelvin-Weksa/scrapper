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
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined';

function msToTime ( duration ) {
    var minutes = parseInt ( ( duration / ( 1000 * 60 ) ) % 60 )
        , hours = parseInt ( ( duration / ( 1000 * 60 * 60 ) ) % 24 );

    hours =  ( hours < 10 ) ? "0" + hours : hours;
    minutes = ( minutes < 10 ) ? "0" + minutes : minutes;
    return hours + ":hrs " + minutes + ": mins";
}

const useStyles = makeStyles(theme => ({
  card: {
    overflow: 'visible',
    width : theme.mixins.toolbar.minHeight*4,
    height: theme.mixins.toolbar.minHeight*3,
    transition : "all 300ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    "&:hover": {
      transform: `scale(1.1)` ,
      boxShadow: `0 0 11px ` ,
    },
  },
  info: {
    display: 'flex' ,
    justifyContent: 'center' ,
    width : theme.mixins.toolbar.minHeight,
    height: theme.mixins.toolbar.minHeight,
    position: 'relative' ,
    top: '-4vh',
    left: '5vh',
    border: `1px solid ${theme.palette.primary.main}` ,
    borderRadius: '2px',
    backgroundColor: theme.palette.primary.main,
    boxShadow: `0 0 11px ` ,
  },
  cover:{
    borderRadius: '25px',
    display:'flex',
    justifyContent:'center',
    background : `#DCDCDC	` ,
    flexDirection:'column',
    transition : "all 300ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    alignItems: 'center'
  },
  rootButton:{
    textAlign:'left',
    position:'relative',
    left:'-5vh',
    top:'-5vh',
  }
}));

export default React.forwardRef( function SimpleCard ( props , ref ) {
  const classes = useStyles();

  function clicked ( ){
    props.onClick ( )
  }

  return (
    <Grid item >
      <div className={classes.cover}  style={{boxShadow: `inset -5px -5px 11px ${props.shade}` ,}}>
      <Tooltip title={props.title} open={props.tooltipOpen}>
        <Button  className={classes.rootButton} onClick={clicked} {...props}>
          <Card  className={classes.card} ref={ref}>
            <Card  className={classes.info}>
              <IconButton  className={classes.rightIcon}>
                {props.icon}
              </IconButton>
            </Card>
            <div style={{display:'flex',flexFlow:'column no-wrap'}}>
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
              </CardContent>
            </div>
          </Card>
        </Button>
        </Tooltip>
        <Typography variant='subtitle2' color="secondary" style={{position:'relative',top:'-5vh'}}>
          {props.expiry ? `expiring on :` : ``}
        </Typography>
        <Typography variant='subtitle2' color="secondary" style={{position:'relative',top:'-5vh'}}>
          {props.expiry ? `${props.expiry.toString().split(' ').slice ( 0 , 5 ).join(' ')}` : ``}
        </Typography>
        <Typography variant='subtitle1' color="primary" style={{position:'relative',top:'-5vh'}}>
          {props.expiry ? Math.round((props.expiry - new Date())/86400000) > 1 ? `${Math.round((props.expiry - new Date())/86400000)} days remaining` : `${msToTime((props.expiry - new Date())%86400000)} remaining` : ``}
        </Typography>
        <Typography variant="caption" component="p" color="textSecondary">
          <CheckCircleOutlinedIcon/>analytics Dashboard
        </Typography>
        <Typography variant="caption" component="p" color="textSecondary">
          <CheckCircleOutlinedIcon/>email Alerts
        </Typography>
        <Typography variant="caption" component="p" color="textSecondary">
          <CheckCircleOutlinedIcon/>social Media Activity
        </Typography>
      </div>
    </Grid>
  );
}
)
//export default function React.forwardRef ( ( props , ref ) =>  ( SimpleCard ))
