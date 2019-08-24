import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Linkedin from 'mdi-material-ui/LinkedinBox';
import Email from '@material-ui/icons/EmailOutlined';
import CallIcon from '@material-ui/icons/CallOutlined';
import PermPhoneMsgOutlinedIcon from '@material-ui/icons/PermPhoneMsgOutlined';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';


// core components
const useStyles = makeStyles ( theme =>  ( {
  paper: {
    position: 'relative',
    padding: theme.spacing ( 1 ) ,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height : '250%' ,
  },
  layer1: {
    position: 'absolute',
    zIndex : theme.zIndex.drawer ,
    width: "95%",
    //marginRight: "3%",
  },
  layer2: {
    position: 'absolute',
    zIndex : theme.zIndex.tooltip ,
    backgroundColor: theme.palette.secondary.light ,
    borderRadius: theme.shape.borderRadius ,
  } ,
  image:{
    maxHeight : '75%' ,
    maxWidth : '100%',
  },
  text:{
    position: 'absolute',
    textAlign:"left" ,
    color: theme.palette.secondary.light,
  }
} ) );

export default function ImageCard ( props ) {
  const classes = useStyles ( );
  let image = React.createRef ( );
  let layer1 = React.createRef ( );
  let layer2 = React.createRef ( );
  let layer3 = React.createRef ( );
  let paper = React.createRef ( );

  const { phone , mail , fax , map } = props
  const [ shown , setShown ] = React.useState ( "" );

  function show ( node ) {
    setShown( node );
  }

  function positioning (  ) {
    let img = image.current;
    let item = img.parentElement.parentElement;
    let item1 = layer1.current;
    let item2 = layer2.current;
    let item3 = layer3.current;
    let item4 = paper.current;

    let thresholdW = parseInt ( getStyle ( item , 'width' ).replace ( 'px' , '' ) );

    //console.log ( "thresholdW " + ( img.width < thresholdW ) );

    let topOffset =  parseInt ( getStyle ( item1 , 'top' ).replace ( 'px' , '' ) ) + img.height - 20;
    item2.style.top = topOffset.toString( ) + 'px'
    item3.style.top = ( topOffset + 50 ).toString ( ) + 'px';
    item4.style.height = ( topOffset + 100 ).toString ( ) + 'px'; ;

    let leftOffset =  parseInt ( getStyle ( item1 , 'left' ).replace ( 'px' , '' ) ) + ( img.width / 2 );
    item2.style.left = ( leftOffset - item2.offsetWidth / 2 ).toString ( ) + 'px';

    if ( img.width < thresholdW ){
      let drift = ( ( thresholdW - img.width ) * 100 / thresholdW ) / 2;
      //console.log ( "thresholdW " + drift );
      //item1.style.marginLeft = (drift - 2).toString ( ) + '%';
      item2.style.marginLeft = (drift - 2).toString ( ) + '%';
    }

  }

  function getStyle ( x , styleProp ){
     var y
     if ( x.currentStyle )
      y = x.currentStyle[ styleProp ];
     else if ( window.getComputedStyle )
      y = document.defaultView.getComputedStyle ( x ,null ).getPropertyValue ( styleProp );
     return y;
   }

  return (
    <Paper className={classes.paper}ref={paper}>
      <div className={classes.layer1} ref={layer1}>
        <img ref={image}
          onLoad={positioning}
          src={props.src}
          className={classes.image}
          alt=""
        />
      </div>
      <div className={classes.layer2} ref={layer2}>
        <Button size="small" color="primary" onClick={()=>show(
          <div>
            <Linkedin/>
            LinkedIn...
          </div>)}>
          <Linkedin/>
        </Button>
        <Button size="small" color="primary" onClick={()=>show(
          <div>
            <Email/>
            {mail? mail : "mail..."}
          </div>)}>
          <Email/>
        </Button>
        <Button size="small" color="primary" onClick={()=>show(
          <div>
            <CallIcon/>
            {phone ? phone : "phone..."}
          </div>)}>
          <CallIcon/>
        </Button>
        <Button size="small" color="primary" onClick={()=>show(
          <div>
            <PermPhoneMsgOutlinedIcon/>
            {fax ? fax : "fax..."}
          </div>)}>
          <PermPhoneMsgOutlinedIcon/>
        </Button>
      </div>
      <Typography className={classes.text} ref={layer3} variant="h5">
        {shown}
      </Typography>
    </Paper>
  );
}
